$(function() {
    var bus = new Bacon.Bus();
    var typedStream = function(f) {
        return bus.filter(f).map(f);
    };

    var eventJournal = bus
        .filter(function(e) {return !e.modelDriven;})
        .scan([], function(j, e) { 
            j.push(e);
            return j;
        });
    eventJournal.onValue(function(v) {$("#events").text(JSON.stringify(v))});

    var initialState = {
        time: 0,
        hp: 17,
        attack: 3,
        defence: 7,
        speed: 7,
        initiative: 5
    };

    var stateFunctions = {
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

    var apply = function(a, b) {
        for(var key in b) { // should only ever be one key
            return stateFunctions[key](a,b[key]);
        }
    }
    var varsConfuseMe = function(key) { return function(e) { return e[key];}};

    var state = {};
    for (var key in initialState) {
        state[key] = typedStream(function(e) { return e.state; })
            .filter(varsConfuseMe(key)).map(varsConfuseMe(key))
            .scan(initialState[key], apply);
        state[key].assign($(".stat-"+key), "text");
    }

    bus.plug($('#nextSecond').asEventStream("click").map(function() {
        return { state: { time: { add: 1 } } };
    }));

    for(var key in initialState) {
        $(".createStateEvent .state").append("<option>"+key+"</option>");
    }
    for(var key in stateFunctions) {
        $(".createStateEvent .function").append("<option>"+key+"</option>");
    }
    bus.plug($('.createStateEvent .createEvent').asEventStream("click").map(function() {
        var val = parseInt($(".createStateEvent .value").val());
        var fn = {}
        fn[$(".createStateEvent .function").val()] = val;

        var state = {}
        state[$(".createStateEvent .state").val()] = fn;
        return {state: state};
    }));
});