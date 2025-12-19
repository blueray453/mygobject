function ValueCell(initialValue) {
    var currentValue = initialValue;
    var watchers = [];

    return {
        val: function () {
            return currentValue;
        },
        update: function (f) {
            var oldValue = currentValue;
            var newValue = f(oldValue);
            if (oldValue !== newValue) {
                currentValue = newValue;
                watchers.forEach(function (watcher) {
                    watcher(newValue);
                });
            }
        },
        addWatcher: function (f) {
            watchers.push(f);
        }
    };
}

var counter = ValueCell(0);

counter.addWatcher(function (val) {
    console.log("Counter updated to", val);
});

counter.update(x => x + 1); // logs: Counter updated to 1
counter.update(x => x + 1); // logs: Counter updated to 2
counter.update(x => x);     // no change, no log
