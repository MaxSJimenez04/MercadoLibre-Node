const { Model } = require("sequelize")

const ClaimTypes = {
    Name: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name',
    GivenName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname',
    Role: 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
}

module.exports = ClaimTypes