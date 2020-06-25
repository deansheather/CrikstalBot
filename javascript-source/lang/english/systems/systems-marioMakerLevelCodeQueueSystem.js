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

$.lang.register('mariomakercodequeuesystem.open.error.opened', 'The queue is already opened.');
$.lang.register('mariomakercodequeuesystem.open.error.usage', 'Usage: !smmqueue open <size> <max per user> - Make the sizes zero if you want them to be unlimited.');
$.lang.register('mariomakercodequeuesystem.open.usage', 'Usage: !smmqueue open <size> <max per user>');
$.lang.register('mariomakercodequeuesystem.open.error.clear', 'The previous queue was not cleared. Use "!smmqueue clear" to clear it.');
$.lang.register('mariomakercodequeuesystem.open.success', 'The queue is now opened! Use !add <course code> to add your codes!');

$.lang.register('mariomakercodequeuesystem.close.error', 'The queue is currently not open.');
$.lang.register('mariomakercodequeuesystem.close.success', 'The queue is now closed! Thanks for adding your codes!');

$.lang.register('mariomakercodequeuesystem.clear.success', 'The queue has been reset and cleared.');

$.lang.register('mariomakercodequeuesystem.add.usage', 'Usage: !add <course code>');
$.lang.register('mariomakercodequeuesystem.add.error.full', 'The queue is currently full.');
$.lang.register('mariomakercodequeuesystem.add.error.invalidcode', 'Invalid code. Super Mario Maker 2 codes are in the format XXX-XXX-XXX.');
$.lang.register('mariomakercodequeuesystem.add.error.codeexists', 'Looks like that code is already in the queue in position $1.');
$.lang.register('mariomakercodequeuesystem.add.error.exceededmaxcodes', "Looks like you've posted too many codes. Wait until one of your requests are played before adding any new codes.");
$.lang.register('mariomakercodequeuesystem.add.added', 'Added your code to the queue!');

$.lang.register('mariomakercodequeuesystem.remove.usage', 'Usage: !smmqueue remove <course code>');
$.lang.register('mariomakercodequeuesystem.remove.error.invalidcode', 'Invalid code. Super Mario Maker 2 codes are in the format XXX-XXX-XXX.');
$.lang.register('mariomakercodequeuesystem.remove.success', 'The course code has been removed from the queue.');
$.lang.register('mariomakercodequeuesystem.remove.404', 'That course code does not seem to be in the queue.');

$.lang.register('mariomakercodequeuesystem.info.success', 'Current course code queue informaton: Codes: [$1], Max Size: [$2], Max Per User: [$3], Opened At: [$4]');

$.lang.register('mariomakercodequeuesystem.time.info', '($1 ago)');

$.lang.register('mariomakercodequeuesystem.position.usernext', "$1's next course code is currently in position $2 in the queue.");
$.lang.register('mariomakercodequeuesystem.position.error.usernotinqueue', "The user $1 doesn't seem to be in the queue.");
$.lang.register('mariomakercodequeuesystem.position.code', '$1 is currently in position $2.');
$.lang.register('mariomakercodequeuesystem.position.error.codenotinqueue', "The code $1 doesn't seem to be in the queue.");

$.lang.register('mariomakercodequeuesystem.queue.list', 'Current queue list: $1.');
$.lang.register('mariomakercodequeuesystem.queue.list.limited', 'Current queue list: $1. (displaying $2 of $3)');
$.lang.register('mariomakercodequeuesystem.queue.list.empty', 'No course codes are in the queue.');

$.lang.register('mariomakercodequeuesystem.queue.next', 'Next Super Mario Maker 2 course code: $1 (submitted by $2).');

$.lang.register('mariomakercodequeuesystem.queue.pick', 'Picked Super Mario Maker 2 course code: $1 (submitted by @$2).');

$.lang.register('mariomakercodequeuesystem.usage', 'Usage: !smmqueue [open / close / clear / next / list / pick / position / info]');
