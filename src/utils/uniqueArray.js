module.exports.uniqueArray = function(array) {
    const uniqueUsers = array.reduce((unique,item) => {
        if(unique.includes(String(item))) {
            return unique
        } else {
            return [...unique, String(item)]
        }
    },[])
    return uniqueUsers
}