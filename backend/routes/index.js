const express = require('express')
const HelloWorld = require('../controllers/HelloWorld')
const Users = require('../controllers/Users')

const router = express.Router()


/**
 * LOGIN  
 */
//Customer
router.post('/customer/login',Users.login)
router.post('/restaurant/register',Users.register)

//Restaurant
router.post('/restaurant/login',Users.login)
router.post('/restaurant/register',Users.register)

//Debug
router.post('/qwertyuiop/users',Users._get_all_users)


/**
 * These example will be deleted after Sprint 1. 
 * HelloWorld test routes
 */
router.get('/helloworld', HelloWorld.getHelloWorld)
router.post('/helloworld', HelloWorld.postHelloWorld)
router.put('/helloworld', HelloWorld.putHelloWorld)
router.delete('/helloworld', HelloWorld.deleteHelloWorld)


module.exports = router
