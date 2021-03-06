const format = require('pg-format')
const {pool} = require('../database/index.js')
const helpers = require('../helpers/helpers')

/**
 * Query for retrieving all the items from the items table
 */
function getAllItems()
{
        return pool.query('SELECT * FROM items,categories WHERE items.cat_id=categories.cat_id')
                .then(res => {
                        return res.rows
                })
                .catch(err => {
                        return {error: err, errCode: 500}
                })
}

/**
 * Query to retrieve items for a specific restaurant from the items table
 * Selection is done by rest_id
 */
function getAllItemsByRestaurantID(rest_id)
{
        if(!helpers._isValidEmail(rest_id))
                return {error: "rest_id is invalid"}

        const query = format('SELECT * FROM items,categories WHERE items.cat_id=categories.cat_id AND items.rest_id = %L', rest_id)

        return pool.query(query)
                .then(res => {
                        return res.rows
                })
                .catch(err => {
                        return {error: err, errCode: 500}
                })
}

/**
 * Query to retrieve an specific item from the items table
 * Selection is done by item_id
 */
function getItemByID(id)
{
        if(!helpers._isPositiveOrZeroInteger(id))
                return {error: "id is invalid"}

       return pool.query('SELECT * FROM items,categories WHERE items.cat_id=categories.cat_id AND item_id = $1', [id])
                .then(res => {
                        // should ONLY be one match
                        return res.rows[0] || null
                })
                .catch(err => {
                        return {error: err, errCode: 500}
                })
}

/**
 * Query to insert a new item.
 * item_id is set to default and the database will take care of incrementing it
 */
function createItem(values)
{
        //check the values
        const check = _checkItemCreationParameters(values)
        //console.log(check)

        if(check.err)
                return {error: check.err, errCode: 400}

        //construct the query
        let db_values = [values.title, values.desc, values.price, values.visible || '0', values.rest_id, values.url, values.cat_id]

        const query = format('INSERT INTO items VALUES (DEFAULT, %L) RETURNING *', db_values)
        if(query.error)
                return {error: query.error, errCode: 400}

        return pool.query(query)
                .then((res) => {
                       return res.rows[0] || null
                })
                .catch(err => {
                        return {error: err, errCode: 500}
                })
}

/**
 * Query to delete an item from items table selected by item_id
 */
function deleteItem(id)
{
        if(!helpers._isPositiveOrZeroInteger(id))
                return {error: "ID is not valid"}

        return pool.query('DELETE FROM items WHERE item_id = $1 RETURNING *', [id])
                .then((res) => {
                        return res.rows[0] || null
                })
                .catch(err => {
                        return {error: err, errCode: 500}
                })
}

/**
 * Modify the values of an item from the tables items, selected by id
 */
function updateItem(id, values)
{
        if(!helpers._isPositiveOrZeroInteger(id))
                return {error: "ID is not valid"}

        const check = _checkItemUpdateParameters(values)
        //console.log(check)
        if(check.err)
                return {error: check.err, errCode: 400}

        const query = helpers._createUpdateDynamicQuery(values,'items', 'item_id') // Update table items via its item_id

        //console.log(query);

        if(query.error)
                return {error: query.error, errCode: 400}

        return pool.query(query)
                .then((res) => {
                        return res.rows[0] || null
                })
                .catch(err => {
                        return {error: err, errCode: 500}
                })
}

/**
 * Function to check for the existance of an item by its id
 */
function existsItemID(item_id)
{
        if(!helpers._isPositiveOrZeroInteger(item_id))
                return {error: "Item ID is not valid"}

        return pool.query('SELECT COUNT(*) FROM items WHERE item_id = $1', [item_id])
                .then((res) => {
                        if(res.rows[0].count > 0)
                                return {exists: true}
                        else
                                return {exists: false}
                })
                .catch(err => {
                        return {error: err, errCode: 500}
                })
}

/**
 * Auxiliary function to check for the parameters of a body
 * This function is called in the context of item creation
 * Certain parameters are necessary for the creation of an item
 * or have certain constraints and requirements.
 * This functions checks for this constraints and if any of them
 * if violated, an error string is concatenated with previous errors.
 * Finally, an string with all the errors is returned
 */
function _checkItemCreationParameters(params)
{
        var err_str = ''

        if(!(params.title))
                err_str = err_str.concat("No title provided for item\n")
        if(params.title && params.title.length > 30)
                err_str = err_str.concat("Title exceeds the limit of 30 chars\n")
        if(params.title && !helpers._isValidString(params.title))
                err_str = err_str.concat("Title is not valid\n")

        if(!(params.desc))
                err_str = err_str.concat("No description provided for item\n")
        if(params.desc && params.desc.length > 200)
                err_str = err_str.concat("Description exceeds the limit of 200 chars\n")
        if(params.desc && !helpers._isValidString(params.desc))
                err_str = err_str.concat("Description contents are not valid\n")

        if(!(params.price))
                err_str = err_str.concat("No price provided for item\n")
        if(params.price && params.price < 0)
                err_str = err_str.concat("Item price is a negative number\n")
        if(params.price && !helpers._isPositiveOrZeroFloat(params.price))
                err_str = err_str.concat("Price is not valid\n")

        if(!(params.url))
                err_str = err_str.concat("No image URL provided for item\n")
        if(params.url && params.url.length > 200)
                err_str = err_str.concat("Image URL exceeds the limit of 200 chars\n")
        if(params.url && !helpers._isValidURL(params.url))
                err_str = err_str.concat("URL is not valid\n")

        if(!(params.rest_id))
                err_str = err_str.concat("No restaurant provided for item\n")
        if(params.rest_id)
        {
                if(params.rest_id > 50)
                        err_str = err_str.concat("Restaurant exceeds the limit of 50 chars\n")
                // check that the restaurant exists
                // also, check that the token_rest == rest_id
                if(!helpers._isValidEmail(params.rest_id))
                        err_str = err_str.concat("Restaurant is not valid\n")
        }
        
        if(!(params.cat_id))
                err_str = err_str.concat("No category ID provided for item\n")
        if(params.cat_id && params.cat_id < 0)
                err_str = err_str.concat("Category ID is a negative number\n")
        if(params.cat_id && !helpers._isPositiveOrZeroInteger(params.cat_id))
                err_str = err_str.concat("Category is not valid\n")

        //if errors happenend, return the error string
        if(err_str.length > 0)
                return {err: err_str}

        //if no errors happened, return a boolean indicated all OK
        return {all_good: true}
}

/**
 * Auxiliary function to check for the parameters of a body
 * This function is called in the context of item update
 * The parameters of an item have constraints that must be
 * checked before an update is possible.
 * This functions checks for this constraints and if any of them
 * if violated, an error string is concatenated with previous errors.
 * Finally, an string with all the errors is returned
 * body is expected to have more than 0 key:value pairs
 */
function _checkItemUpdateParameters(params)
{
        var err_str = ''

        if(params.title && params.title.length > 30)
                err_str = err_str.concat("Title exceeds the limit of 30 chars\n")
        if(params.title && !helpers._isValidString(params.title))
                err_str = err_str.concat("Title is not valid\n")

        if(params.desc && params.desc.length > 200)
                err_str = err_str.concat("Description exceeds the limit of 200 chars\n")
        if(params.desc && !helpers._isValidString(params.desc))
                err_str = err_str.concat("Description contents are not valid\n")

        if(params.price && params.price < 0)
                err_str = err_str.concat("Item price is a negative number\n")
        if(params.price && !helpers._isPositiveOrZeroFloat(params.price))
                err_str = err_str.concat("Price is not valid\n")

        if(params.url && params.url.length > 200)
                err_str = err_str.concat("URL exceed the limit of 200 chars\n")
        if(params.url && !helpers._isValidURL(params.url))
                err_str = err_str.concat("URL is not valid\n")

        if(params.rest_id)
        {
                if(params.rest_id > 50)
                        err_str = err_str.concat("Restaurant exceeds the limit of 50 chars\n")
                // check that the restaurant exists
                // also, check that the token_rest == rest_id
                if(!helpers._isValidEmail(params.rest_id))
                        err_str = err_str.concat("Restaurant is not valid\n")

        }

        if(params.cat_id && params.cat_id < 0)
                err_str = err_str.concat("Category ID is a negative number\n")
        if(params.cat_id && !helpers._isPositiveOrZeroInteger(params.cat_id))
                err_str = err_str.concat("Category is not valid\n")


        if(err_str.length > 0)
                return {err: err_str}

        return {all_good: true}
}



module.exports = {getItemByID, createItem, updateItem, deleteItem, getAllItems, getAllItemsByRestaurantID, existsItemID}
