const success = ( req, res, data, status) => {
    let response = {
        error: '',
        data: data,
        method: req.method
    }

    res.status( status || 200).json( response );
}

const error = ( req, res, error, status) => {
    let response = {
        error: error,
        data: '',
        method: req.method
    }

    res.status( status || 400).json( response );
}

module.exports = {
    success, 
    error
}