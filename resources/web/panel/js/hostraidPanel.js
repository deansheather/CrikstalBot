/*
 * Copyright (C) 2016 phantombot.tv
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

/* 
 * @author IllusionaryOne
 */

/*
 * hostraidPanel.js
 */

(function() {

   var refreshIcon = '<i class="fa fa-refresh" />',
       spinIcon = '<i style=\"color: #6136b1\" class="fa fa-spinner fa-spin" />',
       modeIcon = [],
       settingIcon = [];

       modeIcon['false'] = "<i style=\"color: #6136b1\" class=\"fa fa-circle-o\" />";
       modeIcon['true'] = "<i style=\"color: #6136b1\" class=\"fa fa-circle\" />";

       settingIcon['false'] = "<i class=\"fa fa-circle-o\" />";
       settingIcon['true'] = "<i class=\"fa fa-circle\" />";

    var hostHistory = false;

    /*
     * onMessage
     * This event is generated by the connection (WebSocket) object.
     */
    function onMessage(message) {
        var html = '',
            msgObject;

        try {
            msgObject = JSON.parse(message.data);
        } catch (ex) {
            return;
        }

        if (panelHasQuery(msgObject)) {

            if (panelCheckQuery(msgObject, 'hostraid_settings')) {
                for (var idx in msgObject['results']) {
                    if (panelMatch(msgObject['results'][idx]['key'], 'hostReward')) {
                        $('#hostRewardInput').attr('placeholder', msgObject['results'][idx]['value']).blur();
                    }
                    if (panelMatch(msgObject['results'][idx]['key'], 'hostMessage')) {
                        $('#hostAnnounceInput').attr('placeholder', msgObject['results'][idx]['value']).blur();
                    }
                    if (panelMatch(msgObject['results'][idx]['key'], 'hostHistory')) {
                        hostHistory = msgObject['results'][idx]['value'];
                        $('#hostHistoryMode').html(modeIcon[msgObject['results'][idx]['value']]);
                    }
                    if (panelMatch(msgObject['results'][idx]['key'], 'raidMessage')) {
                        $('#raidMessageInput').attr('placeholder', msgObject['results'][idx]['value']).blur();
                    }
                }
            }

            if (panelCheckQuery(msgObject, 'hostraid_hosthistory')) {
                if (msgObject['results'].length === 0) {
                    $('#hostHistoryList').html('<i>No Host History Data to Display</i>');
                    return;
                }

                html = '<table><tr><th>Channel</th><th style="float: right">Date/Time</th></tr>';

                for (idx = msgObject['results'].length - 1; idx >= 0; idx--) {
                    var hostData = JSON.parse(msgObject['results'][idx]['value']);
                    html +='<tr style="textList">' +
                           '  <td>' + hostData['host'] + '</td>' +
                           '  <td style="float: right">' + $.format.date(parseInt(hostData['time']), "MM.dd.yy hh:mm:ss") + '</td>' +
                           '</tr>';
                }
                html += '</table>';
                $('#hostHistoryList').html(html);
            }

            if (panelCheckQuery(msgObject, 'hostraid_inraids')) {
                if (msgObject['results'].length === 0) {
                    $('#incomingRaidList').html('<i>No Incoming Raid Data to Display</i>');
                    return;
                }

                html = '<br><table><tr><th>Channel</th><th style="float: right">Raid Count</th></tr>';

                for (idx in msgObject['results']) {
                    html += '<tr style="textList">' +
                            '    <td>' + msgObject['results'][idx]['key'] + '</td>' +
                            '    <td style="float: right">' + msgObject['results'][idx]['value'] + '</td>' +
                            '</tr>';
                }
                html += '</table>';
                $('#incomingRaidList').html(html);
            }

            if (panelCheckQuery(msgObject, 'hostraid_outraids')) {
                if (msgObject['results'].length === 0) {
                    $('#outgoingRaidList').html('<i>No Outgoing Raid Data to Display</i>');
                    return;
                }

                html = '<br><table><tr><th>Channel</th><th style="float: right">Raid Count</th></tr>';

                for (idx in msgObject['results']) {
                    html += '<tr style="textList">' +
                            '    <td>' + msgObject['results'][idx]['key'] + '</td>' +
                            '    <td style="float: right">' + msgObject['results'][idx]['value'] + '</td>' +
                            '</tr>';
                }
                html += '</table>';
                $('#outgoingRaidList').html(html);
            }
        }

        if (panelCheckQuery(msgObject, 'hostraid_autohost')) {
            for (var idx in msgObject['results']) {
                if (panelMatch(msgObject['results'][idx]['key'], 'enabled')) {
                    $('#autoHostToggle').html(modeIcon[msgObject['results'][idx]['value']]);
                }
                if (panelMatch(msgObject['results'][idx]['key'], 'delay_time_minutes')) {
                    $('#autoHostDelay').val(msgObject['results'][idx]['value']);
                }
                if (panelMatch(msgObject['results'][idx]['key'], 'host_time_minutes')) {
                    $('#autoHostTime').val(msgObject['results'][idx]['value']);
                }
            }
        }

        if (panelCheckQuery(msgObject, 'hostraid_autohostlist')) {
            if (msgObject['results'].length === 0) {
                $('#autoHostList').html('<i>Theres no one in the auto host list.</i>');
                return;
            }

            html = "<table>";
            for (idx in msgObject['results']) {
                html += "<tr class=\"textList\">" +
                        "    <td style=\"width: 5%\">" +
                        "        <div id=\"deleteUser_" + msgObject['results'][idx]['key'] + "\" type=\"button\" class=\"btn btn-default btn-xs\" " +
                        "             onclick=\"$.setAutoHostSetting('del', 'deleteUser_', '" + msgObject['results'][idx]['key'] + "')\"><i class=\"fa fa-trash\" />" +
                        "        </div>" +
                        "    </td>" +
                        "    <td>" + msgObject['results'][idx]['key'] + "</td>" +
                        "</tr>";
            }
            html += "</table>";
            $("#autoHostList").html(html);
            handleInputFocus();
        }
    }

    /**
     * @function doQuery
     */
    function doQuery() {
        sendDBKeys('hostraid_hosthistory', 'hosthistory');
        sendDBKeys('hostraid_settings', 'settings');
        sendDBKeys('hostraid_inraids', 'incommingRaids'); 
        sendDBKeys('hostraid_outraids', 'outgoingRaids');
        sendDBKeys('hostraid_autohost', 'autohost_config');
        sendDBKeys('hostraid_autohostlist', 'autohost_hosts');
    }

    /** 
     * @function hostChannel
     */
    function hostChannel() {
        var value = $('#hostChannelInput').val();
        if (value.length > 0) {
            sendCommand('host ' + value);
            $('#hostChannelInput').val('');
        }
    }

    /** 
     * @function raidChannel
     */
    function raidChannel() {
        var value = $('#raidChannelInput').val();
        if (value.length > 0) {
            sendCommand('raid ' + value);
            $('#raidChannelInput').val('');
        }
    }

    /** 
     * @function raiderChannel
     */
    function raiderChannel() {
        var value = $('#raiderChannelInput').val();
        if (value.length > 0) {
            sendCommand('raider ' + value);
            $('#raiderChannelInput').val('');
        }
    }

    /** 
     * @function updateHostAnnounce
     */
    function updateHostAnnounce() {
        var value = $('#hostAnnounceInput').val();
        if (value.length > 0) {
            sendDBUpdate('hostraid_settings', 'settings', 'hostMessage', value);
            sendCommand('reloadhost');
            $('#hostAnnounceInput').attr('placeholder', 'Updating...').blur();
            setTimeout(function() { doQuery(); }, TIMEOUT_WAIT_TIME);
        }
    }

    /** 
     * @function updateHostReward
     */
    function updateHostReward() {
        var value = $('#hostRewardInput').val();
        if (value.length > 0) {
            sendDBUpdate('hostraid_settings', 'settings', 'hostReward', value);
            sendCommand('reloadhost');
            $('#hostRewardInput').attr('placeholder', value).blur();
            setTimeout(function() { doQuery(); }, TIMEOUT_WAIT_TIME);
        }
    }

    /**
     * @function changeHostHistory
     * @param {String} action
     */
    function changeHostHistory(action) {
        if (hostHistory == "true") {
            sendDBUpdate('hostraid_settings', 'settings', 'hostHistory', 'false');
        } else {
            sendDBUpdate('hostraid_settings', 'settings', 'hostHistory', 'true');
        }
        sendCommand('reloadhost');
        setTimeout(function() { doQuery(); }, TIMEOUT_WAIT_TIME);
    }

    /** 
     * @function updateRaidMessage
     */
    function updateRaidMessage() {
        var value = $('#raidMessageInput').val();
        if (value.length > 0) {
            sendDBUpdate('hostraid_settings', 'settings', 'raidMessage', value);
            $('#raidMessageInput').attr('placeholder', 'Updating...').blur();
            setTimeout(function() { doQuery(); }, TIMEOUT_WAIT_TIME);
        }
    }

    function setAutoHostSetting(setting, s, t) {
        var val = $('#' + s).val();

        if (setting == 'enable') {
            $("#autoHostToggle").html("<i style=\"color: #6136b1\" class=\"fa fa-spinner fa-spin\" />");
            sendDBUpdate('auto_host', 'autohost_config', 'enabled', 'true');
            setTimeout(function() { doQuery(); }, TIMEOUT_WAIT_TIME);
            return;
        }

        if (setting == 'disable') {
            $("#autoHostToggle").html("<i style=\"color: #6136b1\" class=\"fa fa-spinner fa-spin\" />");
            sendDBUpdate('auto_host', 'autohost_config', 'enabled', 'false');
            sendDBUpdate('auto_host', 'autohost_config', 'hosting', 'false');
            sendDBDelete('auto_host', 'autohost_config', 'currently_hosting');
            setTimeout(function() { doQuery(); }, TIMEOUT_WAIT_TIME);
            return;
        }

        if (setting == 'del') {
            sendDBDelete('auto_host', 'autohost_hosts', t);
            setTimeout(function() { doQuery(); }, TIMEOUT_WAIT_TIME);
            return;
        }

        if (val.length !== 0) {
            if (setting == 'time') {
                sendDBUpdate('auto_host', 'autohost_config', 'host_time_minutes', val);
                setTimeout(function() { doQuery(); }, TIMEOUT_WAIT_TIME);
                return;
            }

            if (setting == 'delay') {
                sendDBUpdate('auto_host', 'autohost_config', 'delay_time_minutes', val);
                setTimeout(function() { doQuery(); }, TIMEOUT_WAIT_TIME);
                return;
            }

            if (setting == 'add') {
                sendDBUpdate('auto_host', 'autohost_hosts', val, val);
                $('#' + s).val('');
                setTimeout(function() { doQuery(); }, TIMEOUT_WAIT_TIME);
                return;
            }
        }
    }

    // Import the HTML file for this panel.
    $('#hostraidPanel').load('/panel/hostraid.html');

    // Load the DB items for this panel, wait to ensure that we are connected.
    var interval = setInterval(function() {
        if (isConnected && TABS_INITIALIZED) {
            var active = $('#tabs').tabs('option', 'active');
            if (active == 13) {
                doQuery();
                clearInterval(interval);
            }
        }
    }, INITIAL_WAIT_TIME);

    // Query the DB every 30 seconds for updates.
    setInterval(function() {
        var active = $('#tabs').tabs('option', 'active');
        if (active == 13 && isConnected && !isInputFocus()) {
            newPanelAlert('Refreshing Hosts/Raids Data', 'success', 1000);
            doQuery();
        }
    }, 3e4);

    // Export to HTML
    $.hostraidOnMessage = onMessage;
    $.hostraidDoQuery = doQuery;
    $.hostChannel = hostChannel;
    $.raidChannel = raidChannel;
    $.raiderChannel = raiderChannel;
    $.updateHostAnnounce = updateHostAnnounce;
    $.updateHostReward = updateHostReward;
    $.changeHostHistory = changeHostHistory;
    $.updateRaidMessage = updateRaidMessage;
    $.setAutoHostSetting = setAutoHostSetting;
})();
