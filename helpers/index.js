const puppeteer = require('puppeteer');
var jwt = require('jsonwebtoken');
const Excel = require('exceljs');
// response
const response = require("../network/response");

const createToken= ( req, res, users) => {
    const { password, email } = req.body;
        /* Creates the new token with the information that 
            the user provided.
        */
        jwt.sign({ email: email, password: password }, process.env.SECRET || "nomada", function(err, token) {
            console.log("Created token:", token);
            if ( err ){
                response.error(req, res, "Couldn't create token", 500);
            }
            else{
                /* Save the information about the user and its
                    corresponding token.
                */
                users.set(token, {email: email,  password: password} );
                response.success(req, res, {token: token}, 201);
            }
          });  
}

const bearerAuth = ( users, bearer, req, res ) => {
    if ( bearer ){
        /* The first part of the bearer has the string "Bearer"
        We do not require that information, only after the 
        whitespace
        */
        bearer = bearer.split(" ")[1];
        /* Check in the table if the user exists */
         if (users.has( bearer) ){
            return bearer
        }
        else{
            response.error(req, res, 'Bearer authentication does not exists', 401)
        }
    }
    else{
        response.error(req, res, 'Missing bearer authentication', 401)
    }
    return null
}

const scrapping = async ( url  ) => {
    const browser = await puppeteer.launch( {
        headless: false
    });
    /* Creates a new window in the browser for 
        starting the scrapping
    */
    const page = await browser.newPage( );
    await page.goto(url);
    /* Search ALL the <a> tags and retrieve the text and the href data*/
   var aTags = await page.$$eval('a', as => as.map( a => a = {text: a.textContent, href: a.href}));
   
   await browser.close( );
   return aTags;
}

const createExcel = ( data, req, res, options ) =>{
    /* Create the new Excel file and then create a spreadsheet */
    const workbook = new Excel.stream.xlsx.WorkbookWriter( options );
    const worksheet = workbook.addWorksheet('<a> tags');

    /* Give the name of the columns and indicate with <key>
        which is going to be the element of the data that corresponds
        to that column.
    */
    worksheet.columns = [
        { header: 'Text', key: 'text', width: 30 },
        { header: 'Hyperlink', key: 'href', width: 100 },
    ]

    data.map( ( values ) => {
        worksheet.addRow( values ).commit( );
    });
    /* Finally, if the file was succesfully created we send it
        to the user.
    */
    workbook.commit().then(function() {
        console.log('Excel file created');
        res.sendFile(global.appRoot +"\\" + options.filename);
      }).catch( ( ) => {
          response.error(req, res, 'Error while creating Excel file', 400);
      });
}

module.exports = {
    createToken: createToken,
    bearerAuth: bearerAuth,
    scrapping: scrapping,
    createExcel: createExcel
}