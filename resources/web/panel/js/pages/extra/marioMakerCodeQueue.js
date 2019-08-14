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

// Function that queries all of the data we need.
$(run = function() {
    // Check if the module is enabled.
    socket.getDBValues('supermariomakercodequeue_module', {
        tables: ['modules', 'smmQueueSettings'],
        keys: ['./systems/marioMakerCodeQueue.js', 'isActive']
    }, true, function(e) {
        console.log("loaded smm queue state");

        // If the module is off, don't load any data.
        if (!helpers.handleModuleLoadUp(['queueModule', 'queueListModule'], e['./systems/marioMakerCodeQueue.js'], 'queueModuleToggle')) {
            // Remove the chat.
            $('#queue-chat').find('iframe').remove();
            return;
        } else {
            // Add Twitch chat.
            $('#queue-chat').html($('<iframe/>', {
                'frameborder': '0',
                'scrolling': 'no',
                'style': 'width: 100%; height: 532px;',
                'src': 'https://www.twitch.tv/embed/' + getChannelName() + '/chat' + (helpers.isDark ? '?darkpopout' : '')
            }));
        }

        // Update the open button to close if the queue is active.
        if (e['isActive'] === 'true') {
            $('#open-or-close-queue').html($('<i/>', {
                'class': 'fa fa-lock'
            })).append('&nbsp; Close').removeClass('btn-success').addClass('btn-warning');
        }

        // Function that updates the queue list.
        helpers.temp.updateSMMQueueList = function() {
            // Get queue list.
            socket.getDBTableValues('get_smmqueue_list', 'smmQueue', function(results) {
                console.log('started callback', results);

                const table = $('#queue-table');
                const trim = function(username) {
                    if (username.length > 15) {
                        return username.substr(0, 15) + '...';
                    } else {
                        return username;
                    }
                };

                // Sort.
                results.sort(function(a, b) {
                    return parseInt(a.key) - parseInt(b.key);
                });

                // Remove current data content.
                table.find('tr:gt(0)').remove();

                for (let i = 0; i < results.length; i++) {
                    const json = JSON.parse(results[i].value),
                        tr = $('<tr/>');

                    // Add position.
                    tr.append($('<td/>', {
                        'html': parseInt(results[i].key) + 1
                    }));

                    // Add name.
                    tr.append($('<td/>', {
                        'html': trim(json.username),
                        'data-toggle': 'tooltip',
                        'title': json.username
                    }));

                    // Add code.
                    tr.append($('<td/>', {
                        'html': json.code,
                        'data-toggle': 'tooltip',
                        'title': json.code
                    }));

                    // Add the del button.
                    tr.append($('<td/>', {
                        'html': $('<button/>', {
                            'type': 'button',
                            'class': 'btn btn-xs btn-danger',
                            'style': 'float: right',
                            'html': $('<i/>', {
                                'class': 'fa fa-trash'
                            }),
                            'click': function() {
                                socket.wsEvent('rm_queue_code', './systems/marioMakerCodeQueue.js', null,
                                    ['remove', json.code], helpers.temp.updateSMMQueueList);
                            }
                        })
                    }));

                    // Add to the table.
                    table.append(tr);
                }
            });
        };

        helpers.temp.updateSMMQueueList();
    });
});

// Function that handlers the loading of events.
$(function() {
    const QUEUE_SCRIPT = './systems/marioMakerCodeQueue.js';
    let canUpdate = true;

    /*
     * @function Clears the input boxes of the queue.
     */
    const clearQueueInput = function() {
        $('#queue-title').val('');
        $('#queue-cost, #queue-size').val('0');
        $('#queue-permission').val('Viewers');
    };

    // Toggle for the module.
    $('#queueModuleToggle').on('change', function() {
        // Enable the module then query the data.
        socket.sendCommandSync('smmqueue_module_toggle_cmd',
            'module ' + ($(this).is(':checked') ? 'enablesilent' : 'disablesilent') + ' ./systems/marioMakerCodeQueue.js', run);
    });

    // Queue open/close button.
    $('#open-or-close-queue').on('click', function() {
        if ($(this)[0].innerText.trim() === 'Open') {
            let cost = $('#queue-cost'),
                size = $('#queue-size'),
                maxPerUser = $('#queue-per-user'),
                permission = $('#queue-permission').find(':selected').text();

            switch (false) {
                case helpers.handleInputNumber(cost, 0):
                case helpers.handleInputNumber(size, 0):
                case helpers.handleInputNumber(maxPerUser, 0):
                    break;
                default:
                    socket.sendCommand('smmqueue_permisison_update', 'permcomsilent add ' + helpers.getGroupIdByName(permission, true), function() {
                        socket.updateDBValue('smmqueue_command_cost', 'pricecom', 'add', cost.val(), function() {
                            socket.wsEvent('smmqueue_open_ws', QUEUE_SCRIPT, null, ['open', size.val(), maxPerUser.val()], function() {
                                toastr.success('Successfully opened the queue!');
                                // Update the button.
                                $('#open-or-close-queue').html($('<i/>', {
                                    'class': 'fa fa-lock'
                                })).append('&nbsp; Close').removeClass('btn-success').addClass('btn-warning');
                            });
                        });
                    });
            }
        } else {
            socket.wsEvent('close_smmqueue_ws', QUEUE_SCRIPT, null, ['close'], function() {
                toastr.success('Successfully closed the queue!');
                clearQueueInput();
                // Update the button.
                $('#open-or-close-queue').html($('<i/>', {
                    'class': 'fa fa-unlock-alt'
                })).append('&nbsp; Open').removeClass('btn-warning').addClass('btn-success');
            });
        }
    });

    // Clear queue command.
    $('#reset-queue').on('click', function() {
        socket.wsEvent('clear_queue_ws', QUEUE_SCRIPT, null, ['clear'], function() {
            toastr.success('Successfully cleared the queue!');
            clearQueueInput();
            helpers.temp.updateSMMQueueList();
        });
    });

    // Pick code command.
    $('#pick-queue').on('click', function() {
        socket.wsEvent('draw_smmqueue_codes', QUEUE_SCRIPT, null, ['pick'], function() {
            // Alert the user.
            toastr.success('Picked one code from the queue!');
            // Update the list.
            helpers.temp.updateSMMQueueList();
        });
    });

    // Handle mouse over on queue list.
    $('#queueTable').on('mouseenter mouseleave', function(event) {
        canUpdate = event.type === 'mouseleave';
    });

    // Update every 5 seconds.
    helpers.setInterval(function() {
        if (canUpdate) {
            helpers.temp.updateSMMQueueList();
        }
    }, 5e3);
});
