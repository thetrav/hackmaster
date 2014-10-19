$(function() {
    
    var debug = function(selector, value) {
        $(selector).text(JSON.stringify(value));
    }

    var newId = function() {
        var idCounter = 0;
        return function() {
            idCounter += 1;
            return idCounter;
        }
    }();

    // events triggered by user interaction, needs recording
    var inputBus = new Bacon.Bus();
    // events triggered by the model, derived by user interaction
    var modelBus = new Bacon.Bus();
    var mainStream = function() {
        var join = new Bacon.Bus();
        join.plug(inputBus);
        join.plug(modelBus);
        //apply an ID to every event that goes into the combined bus
        return join.map(function (e) {
            return $.extend({id: newId()}, e);
        });
    }();

    var taggedStream = function(name) {
        var f = function(e) {return e.eventType == name};
        return mainStream.filter(f);
    };

    var wireButton = function(selector, event) {
        inputBus.plug($(selector).asEventStream("click").map(function(e) {
                if (typeof(event) == "function") {
                    return event(e);
                } else {
                    return event;
                }
            })
        );
    };

    //record input events in case we need to edit+replay
    var eventJournal = inputBus.scan([], function(j, e) { 
        j.push(e);
        return j;
    });
    eventJournal.onValue(function(v) {debug("#events", v);});

    var functions = {
        add: function(x, y) {
            return x + y;
        },
        sub: function(x, y) {
            return x - y;
        },
        set: function(x, y) {
            return y;
        }
    }

    wireButton(".nextSecond", {eventType: "time", value: 1});
    var time = taggedStream("time").map(function(e){return e.value;})
        .scan(0, functions.add);
    time.assign($(".stat-time"), "text");

    wireButton(".startEffect", function() {
        return { 
            eventType: "startEffect",
            label: $(".effectLabel").val(),
            duration: 2
        };
    });

    var effects = function() {
        var effects = mainStream.filter(function(e) {
            return e.eventType == "startEffect" || e.eventType == "stopEffect";
        }).scan([],
            function(events, event) {
                console.log("event: %o for events: %o", event, events);
                if(event.eventType == "startEffect") {
                    events.push(event);
                    return events;
                } else {
                    return _.reject(events, function(e){return e.id == event.targetId;});
                }
            }
        );

        var timeEffect = function(time) { return function(event) {
            if(!event.endTime && event.endTime != 0) {
                return $.extend(event, {
                    startTime: time,
                    endTime: time + event.duration,
                    timeLeft: event.duration
                });
            } else {
                return $.extend(event, {timeLeft: event.endTime - time});
            }
        }};

        var combined = Bacon.combineWith(function(time, effects) {
            console.log("combining time: %o with effects %o", time, effects);
            return _.map(effects, timeEffect(time));
        }, time, effects);

        combined.onValue(function(events) {
            _.each(events, function(event) {
                if(event.timeLeft <= 0) {
                    modelBus.push({eventType: "stopEffect", targetId: event.id});
                }
            })
        });
        
        return combined;
    }();
    

    effects.onValue(function(v) {
        debug("#effects", v);
        $(".effects").html(
            "<tr><th>effect</th><th>remaining</th><th>endsAt</th>" +
            _.reduce(v, function(memo, item, index, list) {
            return memo + "<tr>"
                + "<td>"+ item.label +"</td>"
                + "<td>"+ item.timeLeft +"</td>"
                + "<td>"+ item.endTime +"</td>"
                + "<td><button class='stopEffect' data-eventid='"+item.id+"'>end</button></td>"
            + "</tr>";
        }, ""));
    });

    inputBus.plug(
        $(".effects").asEventStream("click", ".stopEffect", function(e, a) {
            console.log("click: e: %o o: %o",e, a);
            return {
                eventType: "stopEffect", 
                targetId: $(e.currentTarget).data("eventid")
            };
        })
    );

});