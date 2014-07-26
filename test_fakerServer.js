/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
Components.utils.import('resource://gre/modules/Promise.jsm');
Components.utils.import('resource://testing-common/httpd.js');
Components.utils.import('resource://gre/modules/NetUtil.jsm')
Components.utils.import('resource://gre/modules/CSPUtils.jsm');
Components.utils.import('resource://calendar/modules/calUtils.jsm');
Components.utils.import('resource://gre/modules/FileUtils.jsm');
Components.utils.import('resource:///modules/Services.jsm');
Services.prefs.setBoolPref('javascript.options.showInConsole', true);
Services.prefs.setBoolPref('browser.dom.window.dump.enabled', true);
Services.prefs.setBoolPref('calendar.debug.log', true);
Services.prefs.setBoolPref('calendar.debug.log.verbose', true);

function fakeServer() {
    this.id = '';
    this._propertyBag = null;
    this._responseTemplates = null;
    this.xmlHeader = 'Hello world\n';
    this.httpServer = new HttpServer();
    this.httpServer.start(50002);
    this.localPort = this.httpServer.identity.primaryPort;
    this.httpServer.registerPathHandler('/', this.prefixHandler);
}

fakeServer.prototype = {
    init: function init_storage_calendar(scheduleInboxURL) {
        this.serverCalmgr = cal.getCalendarManager();
        this.calUrl = "http://localhost"+this.localPort+scheduleInboxURL;
        this.storage = this.serverCalmgr.createCalendar("memory", Services.io.newURI(this.calUrl, null, null));
        
    },
    initPropfind: function initPropfind(x,request){
        return ("init PropFind "+request.method);
    },
    getLocalPort: function get_LocalPort() {
        return this.httpServer.identity.primaryPort;
    },
    prefixHandler: function main_PrefixHandler(request, response) {
        dump("\n### prefixHandler");
        try {
            if (request.method == 'PROPFIND' && body.indexOf('current-user-prin') > - 1) {
                //let resText = this.initPropfind(request);
                response.setStatusLine(request.httpVersion, 207, 'Multi-Status');
                response.setHeader('content-type', 'text/xml');
                //response.write(resText);
            } 
            else if (request.method == 'PROPFIND' && body.indexOf('getetag') > - 1) {
    //             let resText = this.propPropfind(request);
                response.setStatusLine(request.httpVersion, 207, 'Multi-Status');
                response.setHeader('content-type', 'text/xml');
    //             response.write(resText);
            } 
            else if (request.method == 'REPORT') {
    //             let reportResText = this.reportPropfind(request);
                response.setStatusLine(request.httpVersion, 207, 'Multi-Status');
                response.setHeader('content-type', 'text/xml');
    //             response.write(reportResText);
            } else {
                dump('### GOT INVALID METHOD ' + request.method + '\n');
                response.setStatusLine(request.httpVersion, 400, 'Bad Request');
                resText = fakeServer.prototype.initPropfind(this, request);
                response.write(resText);
            }
            
            
        } catch (e) {
            dump('\n\n#### EEE: ' + e + e.fileName + e.lineNumber + '\n');
        }
     },    
    test: function test(){
        dump("\n###test :"+this.id);
        
    },
    test1: function test1(){
        dump("\n###test1 : "+this.id);
    }
};

function sogo() {
    this._propertyBag = {
        name: 'sogo',
        id: 'calendar1',
        calendarHomeSetset: '/calendar/',
        scheduleInboxURL: '/calendar/xpcshell',
        scheduleOutboxURL: '/calendar/xpcshell',
        userPrincipalHref: '/users/xpcshell/',
        ctag: '123456',
        supportedComps: ['VEVENT',
                         'VTODO'
                        ],
        userAddressSet: ['user0@example.com',
                         'user1@example.com',
                         'user2@example.com',
                         'user3@example.com'
                    ],
    },

    this._responseTemplates = {
        initPropfind: this.xmlHeader
    }
}

sogo.prototype = new fakeServer();

var sogoObj = new sogo();
sogoObj.id = "Sogo1";

function run_test() {
    sogoObj.init(sogoObj._propertyBag.scheduleInboxURL);
    dump("### Server "+sogoObj.id+" started on "+sogoObj.getLocalPort());
    do_test_pending();
    // do_get_profile();
    // registerFakeUMimTyp();
    //   //start server
    //   var server = new HttpServer();
    //   server.registerPathHandler("/calendar/xpcshell/1b05e158-631a-445f-8c5a-5743b5a05169.ics", createResourceHandler);
    //   server.registerPathHandler("/calendar/", calendarHandler);
    //   server.registerPathHandler("/calendar/xpcshell/", initPropfindHandler);
    //   server.registerPathHandler("/users/xpcshell/",principalHandler);
    //   server.start(serverProperties.port);
    //   do_register_cleanup(() => server.stop(() => {}));
    //   cal.getCalendarManager().startup({onResult: function() {
    //     run_next_test();
    //   }});
}












let item;
let currentScheduleTag;
let currentEtag;
const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>\n';
//set the server preferences
var serverProperties = {
    port: ( - 1),
    name: 'xpcshellServer'
};
//set calendar properties
var calDavProperties = {
    getctag: 1378022830,
    basePath: 'http://localhost:' + serverProperties.port,
    calendarHomeSetset: '/calendar/',
    scheduleInboxURL: '/calendar/xpcshell',
    scheduleOutboxURL: '/calendar/xpcshell',
    userPrincipalHref: '/users/xpcshell/',
    icalString: 'BEGIN:VEVENT\n' +
    'DTSTART:20140725T230000\n' +
    'DTEND:20140726T000000\n' +
    'LOCATION:Paris\n' +
    'TRANSP:OPAQUE\n' +
    'END:VEVENT',
    itemID: '1b05e158-631a-445f-8c5a-5743b5a05169',
    supportedComps: [
        'VEVENT',
        'VTODO'
    ],
    userAddressSet: [
        'mozilla@kewis.ch',
        'uni@kewis.ch',
        'kewisch@kewis.ch',
        '/SOGo/dav/kewisch/'
    ],
    getetag: 2314233447,
    scheduletag: ''
};
var resTemplate = {
    initPropfind: function initPropfind(request) {
        let responseQuery = '<D:multistatus xmlns:a="urn:ietf:params:xml:ns:caldav" xmlns:b="http://calendarserver.org/ns/" xmlns:D="DAV:">\n' +
        '   <D:response>\n' +
        '    <D:href>' + request.path + '</D:href>\n' +
        '     <D:propstat>\n' +
        '       <D:status>HTTP/1.1 200 OK</D:status>\n' +
        '       <D:prop>\n' +
        '         <D:resourcetype>\n' +
        '           <D:collection/>\n' +
        '           <calendar xmlns="urn:ietf:params:xml:ns:caldav"/>\n' +
        '         </D:resourcetype>\n' +
        '         <D:owner xmlns:D="DAV:">\n' +
        '           <D:href>' + calDavProperties.userPrincipalHref + '</D:href>\n' +
        '         </D:owner>\n' +
        '         <D:current-user-principal xmlns:D="DAV:">\n' +
        '           <D:href>' + calDavProperties.userPrincipalHref + '</D:href>\n' +
        '         </D:current-user-principal>\n' +
        '         <n1:supported-calendar-component-set xmlns:n1="urn:ietf:params:xml:ns:caldav" xmlns:D="DAV:">\n';
        for (let i = 0; i < calDavProperties.supportedComps.length; i++) {
            responseQuery += '<n1:comp name="' + calDavProperties.supportedComps[i] + '"/>\n';
        }
        responseQuery += '</n1:supported-calendar-component-set>\n' +
        '         <b:getctag>' + calDavProperties.getctag + '</b:getctag>\n' +
        '       </D:prop>\n' +
        '     </D:propstat>\n' +
        '   </D:response>\n' +
        ' </D:multistatus>';
        return responseQuery;
    },
    propPropfind: function propPropfind(request) {
        item = createEventFromIcalString(calDavProperties.icalString);
        item.id = calDavProperties.itemID;
        let responseQuery = xmlHeader + '\n' +
        '   <D:multistatus xmlns:D="DAV:" xmlns:C="urn:ietf:params:xml:ns:caldav">\n' +
        '     <D:response>\n' +
        '       <D:href>' + request.path + calDavProperties.itemID + '.ics</D:href>\n' +
        '         <D:propstat>\n' +
        '           <D:prop>\n' +
        '             <D:getetag>"' + calDavProperties.getetag + '"</D:getetag>\n' +
        // '             <C:schedule-tag>"'+scheduleTagGenerator("new")+'"</C:schedule-tag>\n'+
        '             <C:calendar-data>' + item + '</C:calendar-data>\n' +
        '           </D:prop>\n' +
        '           <D:status>HTTP/1.1 200 OK</D:status>\n' +
        '         </D:propstat>\n' +
        '     </D:response>\n' +
        '   </D:multistatus>\n';
        return responseQuery;
    },
    reportPropfind: function reportPropfind(request) {
        let responseQuery = xmlHeader + '\n' +
        ' <D:multistatus xmlns:D="DAV:" xmlns:C="urn:ietf:params:xml:ns:caldav">\n' +
        '   <D:response>\n' +
        '     <D:href>' + request.path + calDavProperties.itemID + '.ics</D:href>\n' +
        '     <D:propstat>\n' +
        '        <D:prop>\n' +
        '         <D:getetag>"' + calDavProperties.getetag + '"</D:getetag>\n' +
        // '<C:schedule-tag>"'+scheduleTagGenerator("new")+'"</C:schedule-tag>\n'+
        '         <C:calendar-data>' + item +
        '         </C:calendar-data>\n' +
        '        </D:prop>\n' +
        '        <D:status>HTTP/1.1 200 OK</D:status>\n' +
        '        </D:propstat>\n' +
        '   </D:response>\n' +
        ' </D:multistatus>\n';
        return responseQuery;
    },
    principalSearch: function principalSearch(request) {
        let responseQuery = xmlHeader +
        '<D:multistatus xmlns:a="urn:ietf:params:xml:ns:caldav" xmlns:D="DAV:">\n' +
        '  <D:response>\n' +
        '    <D:href>/calendar/xpcshell/</D:href>\n' +
        '    <D:propstat>\n' +
        '      <D:status>HTTP/1.1 200 OK</D:status>\n' +
        '      <D:prop>\n' +
        '        <a:calendar-home-set>\n' +
        '          <D:href xmlns:D="DAV:">/calendar/</D:href>\n' +
        '        </a:calendar-home-set>\n' +
        '        <a:schedule-inbox-URL>\n' +
        '          <D:href xmlns:D="DAV:">/calendar/xpcshell</D:href>\n' +
        '        </a:schedule-inbox-URL>\n' +
        '        <a:schedule-outbox-URL>\n' +
        '          <D:href xmlns:D="DAV:">/calendar/xpcshell</D:href>\n' +
        '        </a:schedule-outbox-URL>\n' +
        '        <a:calendar-user-address-set>\n';
        for (var i = 0; i < calDavProperties.userAddressSet.length; i++) {
            responseQuery += '<D:href xmlns:D="DAV:">mailto:' + calDavProperties.userAddressSet[i] + '</D:href>\n';
        }
        responseQuery += '</a:calendar-user-address-set>\n' +
        '      </D:prop>\n' +
        '    </D:propstat>\n' +
        '  </D:response>\n' +
        '</D:multistatus>';
        dump('responseQuery\n' + responseQuery);
        return responseQuery;
    }
};
function registerFakeUMimTyp() {
    try {
        Services.dirsvc.get('UMimTyp', Components.interfaces.nsIFile);
    } catch (e) {
        Services.dirsvc.registerProvider({
            getFile: function (prop, persist) {
                if (prop == 'UMimTyp') {
                    var mimeTypes = Services.dirsvc.get('ProfD', Ci.nsIFile);
                    mimeTypes.append('mimeTypes.rdf');
                    return mimeTypes;
                }
                throw Components.results.NS_ERROR_FAILURE;
            }
        });
    }
}
function waitForInit(calendar) {
    let deferred = Promise.defer();
    let caldavCheckSeverInfo = calendar.wrappedJSObject.completeCheckServerInfo;
    let wrapper = function (listener, error) {
        if (Components.isSuccessCode(error)) {
            deferred.resolve();
        } else {
            deferred.reject();
        }
        calendar.wrappedJSObject.completeCheckServerInfo = caldavCheckServerInfo;
        caldavCheckServerInfo(listener, error);
    };
    calendar.wrappedJSObject.completeCheckServerInfo = wrapper;
    return deferred.promise;
}
function promiseAddItem(item, calendar) {
    let deferred = Promise.defer();
    calendar.addItem(item, {
        onOperationComplete: function (aCalendar, aStatus, aOperationType, aId, aDetail) {
            dump('onOperationComplete:' + aCalendar.name + ' ' + aStatus + ' ' + aOperationType + ' ' + aId + ' ' + aDetail + '\n');
            deferred.resolve(aStatus);
        }
    });
    return deferred.promise;
}
//method to create the item with calendar.addItem which is pointed to localhost

add_task(test_doFakeServer);
function test_doFakeServer() {
    let icalString = calDavProperties.icalString;
    var item = createEventFromIcalString(icalString);
    item.id = calDavProperties.itemID;
    let calmgr = cal.getCalendarManager();
    let calendarURL = calDavProperties.basePath + calDavProperties.scheduleInboxURL;
    dump(calendarURL);
    let calendar = calmgr.createCalendar('caldav', Services.io.newURI(calendarURL, null, null));
    calendar.name = 'testCalendar';
    calmgr.registerCalendar(calendar);
    yieldwaitForInit(calendar);
    yieldpromiseAddItem(item, calendar);
}
//handler for incoming requests to http://localhost:50001/calendar/event.ics

function createResourceHandler(request, response) {
    try {
        //get the request and set the response data
        let is = request.bodyInputStream;
        let body = NetUtil.readInputStreamToString(is, is.available(), {
            charset: 'UTF-8'
        });
        item = body;
        let method = request.method;
        let matchheader = request.getHeader('If-None-Match');
        //creating resources
        if (method == 'PUT' && matchheader == '*' && body) {
            dump('GETFILE: 1\n');
            let file = FileUtils.getFile('TmpD', [
                '1b05e158-631a-445f-8c5a-5743b5a05169.ics.tmp'
            ]);
            file.createUnique(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, parseInt('0600', 8));
            //this creates the file at /tmp/
            dump('file_created at : ' + file.path);
            writeToFile(file, body);
            response.setStatusLine(request.httpVersion, 201, 'resource created');
            response.write('');
        } else {
            response.setStatusLine(request.httpVersion, 400, 'Bad Request');
        }
    } catch (e) {
        dump('\n\n#### EEE: ' + e + e.fileName + e.lineNumber + '\n');
    }
}
function initPropfindHandler(request, response) {
    let body;
    try {
        let is = request.bodyInputStream;
        body = NetUtil.readInputStreamToString(is, is.available(), {
            charset: 'UTF-8'
        });
    } catch (e) {
        body = '';
    }
    try {
        if (request.method == 'PROPFIND' && body.indexOf('current-user-prin') > - 1) {
            let resText = resTemplate.initPropfind(request);
            response.setStatusLine(request.httpVersion, 207, 'Multi-Status');
            response.setHeader('content-type', 'text/xml');
            response.write(resText);
        } 
        else if (request.method == 'PROPFIND' && body.indexOf('getetag') > - 1) {
            let resText = resTemplate.propPropfind(request);
            response.setStatusLine(request.httpVersion, 207, 'Multi-Status');
            response.setHeader('content-type', 'text/xml');
            response.write(resText);
        } 
        else if (request.method == 'REPORT') {
            let reportResText = resTemplate.reportPropfind(request);
            response.setStatusLine(request.httpVersion, 207, 'Multi-Status');
            response.setHeader('content-type', 'text/xml');
            response.write(reportResText);
        } else {
            dump('### GOT INVALID METHOD ' + request.method + '\n');
            response.setStatusLine(request.httpVersion, 400, 'Bad Request');
        }
    } catch (e) {
        dump('\n\n#### EEE: ' + e + e.fileName + e.lineNumber + '\n');
    }
}
function calendarHandler(request, response) {
    if (request.method == 'OPTIONS') {
        response.setStatusLine(request.httpVersion, 200, 'OK');
        response.setHeader('DAV', '1, 2, access-control, calendar-access, calendar-schedule, calendar-auto-schedule, calendar-proxy, calendar-query-extended, extended-mkcol, calendarserver-principal-property-search')
        response.write('');
    } else {
        dump('### GOT INVALID METHOD ' + request.method + '\n');
        response.setStatusLine(request.httpVersion, 400, 'Bad Request');
    }
}
function principalHandler(request, response) {
    if (request.method == 'PROPFIND') {
        let principalResText = resTemplate.principalSearch(request);
        response.setStatusLine(request.httpVersion, 207, 'Multi-Status');
        response.write(principalResText);
    } else {
        dump('### PRINCIPAL  HANDLER GOT INVALID METHOD ' + request.method + '\n');
        response.setStatusLine(request.httpVersion, 400, 'Bad Request');
    }
}
function writeToFile(file, data) {
    let ostream = FileUtils.openSafeFileOutputStream(file);
    let converter = Components.classes['@mozilla.org/intl/scriptableunicodeconverter'].createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
    converter.charset = 'UTF-8';
    let istream = converter.convertToInputStream(data);
    NetUtil.asyncCopy(istream, ostream, function (status) {
        if (!Components.isSuccessCode(status)) {
            return ;
        }
        // Data has been written to the file.

    });
}

/*
Exception: Components.utils is undefined
@Scratchpad/6:4:1
*/