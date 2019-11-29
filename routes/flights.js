var express = require('express');
var router = express.Router();

var monk = require('monk');
var db = monk('localhost:27017/airline_system');

// Get all flights
router.get('/', function (req, res) {
    const collection = db.get('flights');
    collection.find({}, function (err, flights) {
        if (err) throw err;
        res.json(flights);
    });
});

// Add one flight
router.post('/', function (req, res) {
    const collection = db.get('flights');
    const flight = req.body;
    collection.insert({
        capacity: flight.capacity,
        price: flight.price,
        departureCity: flight.departureCity,
        arrivalCity: flight.arrivalCity,
        duration: flight.duration,
        takeOffTime: flight.takeOffTime
    }, function (err, flight) {
        if (err) throw err;
        res.json(flight);
    });
});

// Get one flight
router.get('/:id', function (req, res) {
    const collection = db.get('flights');
    collection.findOne({_id: req.params.id}, function (err, flight) {
        if (err) throw err;
        res.json(flight);
    });
});

// Update one flight
router.put('/:id', function (req, res) {
    const collection = db.get('flights');
    const flight = req.body;
    collection.update({
            _id: req.params.id
        },
        {
            capacity: flight.capacity,
            price: flight.price,
            departureCity: flight.departureCity,
            arrivalCity: flight.arrivalCity,
            duration: flight.duration,
            takeOffTime: flight.takeOffTime
        }, function (err, status) {
            if (err) throw err;
            res.json(status);
        });
});

// Delete one flight
router.delete('/:id', function (req, res) {
    const collection = db.get('flights');
    collection.remove({_id: req.params.id}, function (err, status) {
        if (err) throw err;
        res.json(status);
    });
});


// router.get('/type', function (req, res) {
//     var collection = db.get('rooms');
//     collection.find({}, function (err, rooms) {
//         if (err) throw err;
//         //res.json(rooms);
//
//
//         var result = [];
//         for (var i = 0, arrayLen = rooms.length; i < arrayLen; i++) {
//             for (var j = 0, resLen = result.length; j < resLen; j++) {
//                 if (result[j] == rooms[i].type) {
//                     break;
//                 }
//             }
//             if (j == resLen) {
//                 result.push(rooms[i].type)
//             }
//         }
//         res.json(result);
//     });
// });
// router.post('/search', function (req, res) {
//     var collection = db.get('rooms');
//     //console.log(req.body.type);
//     var peopleNumber = parseInt(req.body.peopleNumber);
//
//
//         collection.find({}, function (err, rooms){
//             search(err, rooms);
//         });
//     function prepare(prepareList,rooms,roomType,peopleNumber)
//     {
//         for(var i=0;i<rooms.length;i++)
//         {
//             if(rooms[i].type==roomType)
//             {
//                 if(peopleNumber-parseInt(rooms[i].occupancy)>=0)
//                 {
//                     peopleNumber=peopleNumber-parseInt(rooms[i].occupancy)
//                     prepareList.push(rooms[i]);
//                 }
//             }
//         }
//         return peopleNumber;
//     }
//     function filter(choices,rooms,peopleNumber,temp,index)
//     {
//
//         if(peopleNumber<=0)
//         {
//             choices.push(temp.map(a => {return {...a}}));
//
//             return;
//         }
//         for(var i=index;i<rooms.length;i++)
//         {
//             temp.push(rooms[i]);
//             peopleNumber-=parseInt(rooms[i].occupancy);
//             filter(choices,rooms,peopleNumber,temp.map(a => {return {...a}}),i+1);
//             peopleNumber+=parseInt(rooms[i].occupancy);
//             temp.pop();
//         }
//     }
//
//     function roomType(rooms,roomType,peopleNumber)
//     {
//         var max=-1;
//         var maxoc=0;
//         for(var i=0;i<rooms.length;i++)
//         {
//             var temp=0;
//             var ocNumber=0;
//             for(var j=0;j<rooms[i].length;j++)
//             {
//                 if(rooms[i][j].type==roomType) {
//                     temp++;
//                 }
//                 ocNumber += parseInt(rooms[i][j].occupancy);
//             }
//             if(temp>max||(temp==max&&ocNumber==peopleNumber))
//             {
//                 max=temp;
//                 maxoc=ocNumber;
//                 var final=rooms[i];
//             }
//         }
//         return final;
//     }
//     function search(err,rooms){
//         if (err) throw err;
//         //res.json(rooms);
//
//         var bag={};
//         var result = [];
//
//         var userStart = new Date(req.body.start);
//         console.log(userStart.getTime);
//         var userEnd = new Date(req.body.end);
//         var diffDay = parseInt((userEnd-userStart)/ (1000 * 60 * 60 * 24));
//         bag['diffDay'] = diffDay;
//
//         for (var i = 0, arrayLen = rooms.length; i < arrayLen; i++)
//         {//judge date
//             if(peopleNumber<=0){
//                 break;
//             }
//             if(rooms[i].available=='unavailable') // unavailable or not
//             {
//                 continue;
//             }
//             if(rooms[i].reserved_time==null||rooms[i].reserved_time.length==0)
//             {
//                 result.push(rooms[i]);
//                 //peopleNumber -= rooms[i].occupancy;
//                 continue;
//             }
//
//             for (var j = 0, indexLen = rooms[i].reserved_time.length; j < indexLen; j++)  //judge date
//             {
//
//                 var roomStart = new Date(rooms[i].reserved_time[j].start);
//                 var roomEnd = new Date(rooms[i].reserved_time[j].end);
//
//                 if (Math.max(userStart.getTime(),roomStart.getTime()) < Math.min(userEnd.getTime(),roomEnd.getTime()))
//                 {
//                     //time overlap
//                     break;
//                 }
//                 else
//                 {
//                     result.push(rooms[i]);
//                     //peopleNumber -= rooms[i].occupancy;
//                     break;
//                 }
//             }
//
//         }
//         //filter(choices,rooms,peopleNumber,temp,index)
//         var choices=[];
//         var temp=[];
//         var final=[];
//         var prepareList=[];
//         //peopleNumber=prepare(prepareList,rooms,req.body.roomType,peopleNumber);
//         filter(choices,result,peopleNumber,temp,0);
//         final = roomType(choices, req.body.roomType,peopleNumber);
//
//
//         //from here result means room in available time slot  ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑
//         if(choices.length<=0){
//             bag['result']=[];
//         }
//         else{
//             bag['result']=final;
//         }
//
//         res.json(bag);
//     }
// });
//
// router.get('/capacity', function (req, res) {
//     var collection = db.get('rooms');
//     collection.find({}, function (err, rooms) {
//         if (err) throw err;
//         //res.json(rooms);
//
//
//         var result = [];
//         for (var i = 0, arrayLen = rooms.length; i < arrayLen; i++) {
//             for (var j = 0, resLen = result.length; j < resLen; j++) {
//                 if (result[j] == rooms[i].occupancy) {
//                     break;
//                 }
//             }
//             if (j == resLen) {
//                 result.push(rooms[i].occupancy)
//             }
//         }
//         res.json(result);
//     });
// });

module.exports = router;