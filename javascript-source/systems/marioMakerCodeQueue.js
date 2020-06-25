/*
 * Copyright (C) 2016-2018 phantombot.tv
 * Copyright (C) 2019 Dean Sheather
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

(function() {
    var isOpened = false,
        info = {},
        queue = [];

    /*
     * @function open
     *
     * @param {String} username
     * @param {Number} size
     * @param {Number} maxPerUser
     */
    function open(username, size, maxPerUser) {
        if (isOpened === true) {
            $.say($.whisperPrefix(username) + $.lang.get('mariomakercodequeuesystem.open.error.opened'));
            return;
        }
        if (queue.length > 0) {
            $.say($.whisperPrefix(username) + $.lang.get('mariomakercodequeuesystem.open.error.clear'));
            return;
        }
        if (size === undefined || isNaN(parseInt(size))) {
            $.say($.whisperPrefix(username) + $.lang.get('mariomakercodequeuesystem.open.error.usage'));
            return;
        }
        if (maxPerUser === undefined || isNaN(parseInt(maxPerUser))) {
            $.say($.whisperPrefix(username) + $.lang.get('mariomakercodequeuesystem.open.error.usage'));
            return;
        }

        info = {
            size: parseInt(size),
            maxPerUser: parseInt(maxPerUser),
            time: new Date(),
        };
        queue = [];

        $.say($.lang.get('mariomakercodequeuesystem.open.success'));
        isOpened = true;
        $.inidb.set('smmQueueSettings', 'isActive', 'true');
    }

    /*
     * @function close
     *
     * @param {String} username
     */
    function close(username) {
        if (isOpened === false) {
            $.say($.whisperPrefix(username) + $.lang.get('mariomakercodequeuesystem.close.error'));
            return;
        }

        $.say($.lang.get('mariomakercodequeuesystem.close.success'));
        isOpened = false;
        $.inidb.set('smmQueueSettings', 'isActive', 'false');
    }

    /*
     * @function clear
     *
     * @param {String} username
     */
    function clear(username) {
        isOpened = false;
        queue = [];
        info = {};
        $.inidb.RemoveFile('smmQueue');
        $.say($.whisperPrefix(username) + $.lang.get('mariomakercodequeuesystem.clear.success'));
    }

    /*
     * @function parseCode
     *
     * Parse code into standardised format XXX-XXX-XXX.
     *
     * @param {String} code
     * @return {String} newCode
     */
    function parseCode(code) {
        var codeRegex = /^([A-Z\d]{3})\s*-?\s*([A-Z\d]{3})\s*-?\s*([A-Z\d]{3})$/;
        code = code.trim().toUpperCase();
        var match = code.match(codeRegex);
        if (!match) {
            return "";
        }

        return match[1] + "-" + match[2] + "-" + match[3];
    }

    /*
     * @function add
     *
     * @param {String} username
     * @param {String} code
     */
    function add(username, code) {
        if (isOpened === false) {
            $.returnCommandCost(username, 'add', $.isMod(username));
            return;
        }
        if (info.size !== 0 && (info.size <= queue.length)) {
            $.say($.whisperPrefix(username) + $.lang.get('mariomakercodequeuesystem.add.error.full'));
            $.returnCommandCost(username, 'add', $.isMod(username));
            return;
        }

        // Parse code.
        if (!code) {
            $.say($.whisperPrefix(username) + $.lang.get('mariomakercodequeuesystem.add.usage'));
            return;
        }
        code = parseCode(code);
        if (!code) {
            $.say($.whisperPrefix(username) + $.lang.get('mariomakercodequeuesystem.add.error.invalidcode'));
            $.returnCommandCost(username, 'add', $.isMod(username));
            return;
        }

        // Check for duplicates and exceeding limits.
        var countOfUser = 0;
        for (var i = 0; i < queue.length; i++) {
            if (queue[i].username.trim().toLowerCase() === username.trim().toLowerCase()) {
                countOfUser++;
            }
            if (queue[i].code === code) {
                $.say($.whisperPrefix(username) + $.lang.get('mariomakercodequeuesystem.add.error.codeexists', i+1));
                $.returnCommandCost(username, 'add', $.isMod(username));
                return;
            }
        }
        if (info.maxPerUser > 0 && countOfUser >= info.maxPerUser) {
            $.say($.whisperPrefix(username) + $.lang.get('mariomakercodequeuesystem.add.error.exceededmaxcodes'));
            $.returnCommandCost(username, 'add', $.isMod(username));
            return;
        }

        var oldLength = queue.length;
        var position = queue.push({
            code: code,
            time: new Date(),
            username: username
        });
        resetPosition(oldLength);

        // Send response.
        $.say($.whisperPrefix(username) + $.lang.get('mariomakercodequeuesystem.add.added', position));
        return;
    }

    /*
     * @function remove
     *
     * @param {String} username
     * @param {String} code
     */
    function remove(username, code, reply) {
        if (!code) {
            if (reply) {
                $.say($.whisperPrefix(username) + $.lang.get('mariomakercodequeuesystem.remove.usage'));
            }
            return;
        }
        code = parseCode(code);
        if (!code) {
            if (reply) {
                $.say($.whisperPrefix(username) + $.lang.get('mariomakercodequeuesystem.remove.error.invalidcode'));
            }
            return;
        }

        // Search codes and remove it.
        var oldLength = queue.length;
        for (var i = 0; i < queue.length; i++) {
            if (queue[i].code === code) {
                // Remove the code.
                var entry = queue.splice(i, 1);
                resetPosition(oldLength);
                if (reply) {
                    $.say($.whisperPrefix(username) + $.lang.get('mariomakercodequeuesystem.remove.success'));
                }
                return;
            }
        }

        if (reply) {
            $.say($.whisperPrefix(username) + $.lang.get('mariomakercodequeuesystem.remove.404'));
        }
        return;
    }

    /*
     * @function stats
     *
     * @param {String} username
     */
    function stats(username) {
        if (isOpened === true) {
            $.say($.lang.get('mariomakercodequeuesystem.info.success', queue.length, info.size, info.maxPerUser, date(info.time)));
        } else {
            $.say($.whisperPrefix(username) + $.lang.get('mariomakercodequeuesystem.info.notopen'));
        }
    }

    /*
     * @function date
     *
     * @param  {Number} time
     * @return {String}
     */
    function date(time, simple) {
        var date = new Date(time),
            format = new java.text.SimpleDateFormat('HH:mm:ss z'),
            seconds = Math.floor((new Date() - time) / 1000),
            string = $.getTimeString(seconds);

        format.setTimeZone(java.util.TimeZone.getTimeZone(($.inidb.exists('settings', 'timezone') ? $.inidb.get('settings', 'timezone') : 'GMT')));
        if (simple === undefined) {
            return format.format(date) + ' ' + $.lang.get('mariomakercodequeuesystem.time.info', string);
        } else {
            return format.format(date);
        }
    }

    /*
     * @function position
     *
     * Looks up the position of the next code for a user or a specific code.
     *
     * @param {String} username
     * @param {String} query
     */
    function position(username, query) {
        function usernameResponse(username) {
            for (var i = 0; i < queue.length; i++) {
                if (queue[i].username.toLowerCase() === username.toLowerCase()) {
                    $.say($.whisperPrefix(username) + $.lang.get('mariomakercodequeuesystem.position.usernext', username, queue[i].code, i+1, date(queue[i].time)));
                    return;
                }
            }

            $.say($.whisperPrefix(username) + $.lang.get('mariomakercodequeuesystem.position.error.usernotinqueue', username));
        }

        // Default to current user.
        if (query === undefined) {
            return usernameResponse(username);
        }

        // Otherwise try to parse a code, otherwise hope the input is a
        // username.
        code = parseCode(query);
        if (!code) {
            return usernameResponse(query);
        }
        for (var i = 0; i < queue.length; i++) {
            if (queue[i].code === code) {
                $.say($.whisperPrefix(username) + $.lang.get('mariomakercodequeuesystem.position.code', code, i+1));
                return;
            }
        }

        $.say($.whisperPrefix(username) + $.lang.get('mariomakercodequeuesystem.position.error.codenotinqueue', code));
    }

    /*
     * @function list
     *
     * @param {String} username
     */
    function list(username) {
        // Get strings for each code on this page.
        var strings = [];
        for (var i = 0; i < queue.length; i++) {
            if (i === 5) {
                break;
            }
            strings.push('#' + (i+1) + ': ' + queue[i].code);
        }

        // Print response.
        if (strings.length !== 0) {
            if (queue.length < 6) {
                $.say($.lang.get('mariomakercodequeuesystem.queue.list', strings.join(', ')));
                return;
            }

            $.say($.lang.get('mariomakercodequeuesystem.queue.list.limited', strings.join(', '), 5, queue.length));
            return;
        }

        $.say($.whisperPrefix(username) + $.lang.get('mariomakercodequeuesystem.queue.list.empty'));
    }

    /*
     * @function next
     *
     * @param {String} username
     */
    function next(username) {
        if (queue.length > 0) {
            const entry = queue[0];

            $.say($.whisperPrefix(username) + $.lang.get('mariomakercodequeuesystem.queue.next', entry.code, entry.username));
            return;
        }

        $.say($.whisperPrefix(username) + $.lang.get('mariomakercodequeuesystem.queue.list.empty'));
    }

    /*
     * @function resetPosition
     */
    function resetPosition(oldLength) {
        if (!oldLength) {
            oldLength = queue.length;
        }

        /*for (var i = 0; i < oldLength; i++) {
            $.inidb.del('smmQueue', i);
        }*/
        $.inidb.RemoveFile('smmQueue');

        $.inidb.setAutoCommit(false);
        for (var i = 0; i < queue.length; i++) {
            var temp = {
                'code': queue[i].code,
                'position': i,
                'time': String(date(queue[i].date)),
                'username': String(queue[i].username)
            };
            $.inidb.set('smmQueue', i, JSON.stringify(temp));
        }
        $.inidb.setAutoCommit(true);
    }

    /*
     * @function pick
     *
     * @param {String} username
     */
    function pick(username) {
        var oldLength = queue.length;
        if (queue.length > 0) {
            const entry = queue.shift();
            resetPosition(oldLength);

            $.say($.whisperPrefix(username) + $.lang.get('mariomakercodequeuesystem.queue.pick', entry.code, entry.username));
            return;
        }

        $.say($.whisperPrefix(username) + $.lang.get('mariomakercodequeuesystem.queue.pick.empty'));
    }

    /*
     * @event command
     */
    $.bind('command', function(event) {
        var sender = event.getSender().toLowerCase(),
            command = event.getCommand(),
            args = event.getArgs(),
            action = args[0],
            subAction = args[1];

        if (command.equalsIgnoreCase('smmqueue')) {
            if (action === undefined) {
                $.say($.whisperPrefix(sender) + $.lang.get('mariomakercodequeuesystem.usage'));
                return;
            }

            /*
             * @commandpath queue open [max size] [max per user] - Opens a new
             * queue. Max size and max per user is optional.
             */
            if (action.equalsIgnoreCase('open')) {
                open(sender, (isNaN(parseInt(subAction)) ? 0 : subAction), (isNaN(parseInt(args[2])) ? 0 : args[2]));
            }

            /*
             * @commandpath queue close - Closes the current queue that is
             * open.
             */
            else if (action.equalsIgnoreCase('close')) {
                close(sender);
            }

            /*
             * @commandpath queue clear - Closes and resets the current queue.
             */
            else if (action.equalsIgnoreCase('clear')) {
                clear(sender);
            }

            /*
             * @commandpath queue remove <code> - Removes that code from the
             * queue.
             */
            else if (action.equalsIgnoreCase('remove')) {
                remove(sender, subAction, true);
            }

            /*
             * @commandpath queue list - Gives you the current queue list. Note
             * that if the queue list is very long it will only show the first
             * 5 codes in the queue.
             */
            else if (action.equalsIgnoreCase('list')) {
                list(sender);
            }

            /*
             * @commandpath queue next - Shows the code that will be picked
             * next.
             */
            else if (action.equalsIgnoreCase('next')) {
                next(sender);
            }

            /*
             * @commandpath queue pick - Prints and removes the next code in the
             * queue.
             */
            else if (action.equalsIgnoreCase('pick')) {
                pick(sender);
            }

            /*
             * @commandpath queue position [username|code] - Tells what position
             * a username or specific code is in the queue.
             */
            else if (action.equalsIgnoreCase('position')) {
                position(sender, subAction);
            }

            /*
             * @commandpath queue info - Gives you the current information about
             * the queue that is open.
             */
            else if (action.equalsIgnoreCase('info')) {
                stats(sender);
            }
        }

        /*
         * @commandpath add <course code> - Adds the specified course code to the current queue.
         */
        if (command.equalsIgnoreCase('add')) {
            add(sender, args.join(' '));
        }
    });

    $.bind('initReady', function() {
        $.registerChatCommand('./systems/marioMakerCodeQueue.js', 'add', 7);
        $.registerChatCommand('./systems/marioMakerCodeQueue.js', 'smmqueue', 7);

        $.registerChatSubcommand('smmqueue', 'open', 1);
        $.registerChatSubcommand('smmqueue', 'close', 1);
        $.registerChatSubcommand('smmqueue', 'clear', 1);
        $.registerChatSubcommand('smmqueue', 'remove', 1);
        $.registerChatSubcommand('smmqueue', 'pick', 1);
        $.registerChatSubcommand('smmqueue', 'list', 7);
        $.registerChatSubcommand('smmqueue', 'next', 7);
        $.registerChatSubcommand('smmqueue', 'info', 7);
        $.registerChatSubcommand('smmqueue', 'position', 7);

        $.inidb.set('smmQueueSettings', 'isActive', 'false');
    });

    /**
     * @event webPanelSocketUpdate
     */
    $.bind('webPanelSocketUpdate', function(event) {
        if (event.getScript().equalsIgnoreCase('./systems/marioMakerCodeQueue.js')) {
            var action = event.getArgs()[0];

            if (action.equalsIgnoreCase('open')) {
                open($.channelName, event.getArgs()[1], event.getArgs()[2]);
            } else if (action.equalsIgnoreCase('close')) {
                close($.channelName);
            } else if (action.equalsIgnoreCase('pick')) {
                pick($.channelName);
            } else if (action.equalsIgnoreCase('remove')) {
                remove($.channelName, event.getArgs()[1], false);
            } else if (action.equalsIgnoreCase('clear')) {
                isOpened = false;
                queue = [];
                info = {};
                $.inidb.RemoveFile('smmQueue');
            }
        }
    });
})();
