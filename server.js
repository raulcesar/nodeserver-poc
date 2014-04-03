const
    express = require('express'),
    app = express(),
    startStopDaemon = require('start-stop-daemon');
    
app.use(express.logger('dev'));
app.get('/api/:name', function(req, res) {
    res.json(200, {"hello": req.params.name});
});

startStopDaemon(function() {
    app.listen(3000, function() {
        console.log('ready captain');
    });
});
