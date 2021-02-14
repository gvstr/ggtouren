
exports.handler = function(event, context, callback){
    console.log(event);
    console.log("in backend event handler");
    callback(null, {
        statusCode: 200,
        body: JSON.stringify({message: "hello from backend"}),
    });
}