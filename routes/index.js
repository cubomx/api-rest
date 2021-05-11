const express = require("express");

const ExcelOptions = {
    filename: 'output.xlsx',
    useStyles: false,
    useSharedStrings: true
}

// responses
const response = require("../network/response");
const { createToken,  bearerAuth, scrapping, createExcel } = require("../helpers")

var router = express.Router( );

const users = new Map( );

router.post( "/login", ( ( req, res) => {
    /* Always check if the information of the user is sufficient for the 
        request to proceed.
    */
    if ( !req.body.email ){
        response.error(req, res, "Missing email parameter in the body", 400);
    }
    else if ( !req.body.password ){
        response.error(req, res, "Missing password parameter", 400);
    }
    else{
        createToken( req, res, users );
    }
}));



router.get("/me", ( (req, res) => {
    /* Get the bearer token from the header and proccess it*/
    var bearer = req.headers["authorization"];
    bearer = bearerAuth(users,  bearer, req, res )
    if (bearer !== null){
        var user = users.get(bearer);
        response.success( req, res, {emal: user.email} , 200);
    }
    
}))


router.post("/get-links", ( async (req, res) => {
    var bearer = req.headers["authorization"];
    if (!req.body.url){
        response.error(req, res, 'Missing link', 400);
    }
    else if ( bearerAuth(users,  bearer, req, res ) === null){
        response.error(req, res, 'No', 401 );
    }
    else{
        /* If the authorization and the user send us a link, continue
            to perform the scrapping action.
        */
        const data = await scrapping( req.body.url, req, res );
        createExcel( data, req, res, ExcelOptions );
}}))


module.exports = router;