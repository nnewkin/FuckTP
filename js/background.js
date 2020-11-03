var hostname1Cache = {};
var host1Cache = {};

var HOST;



function getHostname(url) {
	var elem = document.createElement('a');
	elem.href = url;
	return elem.hostname;
}

function getRoot(url) {
	var elem = document.createElement('a');
	elem.href = url;
	return elem.protocol + '//' + elem.hostname + ':' + elem.port;
}

function updateHost(tabId) {
    data = {};
    data['host'] = hostname1Cache[tabId];
    data['data'] = host1Cache[tabId];
    chrome.browserAction.enable(tabId);
    if((data.data.gitV || data.data.svnV || data.data.log0 || data.data.log1 || data.data.log2)){
        chrome.browserAction.setBadgeText({
            'text': String('!')
        });
    }
    // else{
    //     chrome.browserAction.setBadgeText({
    //         'text': String('')
    //     });        
    // }
	HOST = data;
}

function getHost(url) {
	return HOST;
}

function logCheck(url,logPath,callback){
    var xhr = new XMLHttpRequest();
    url += logPath;
    xhr.open("GET", url);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && (xhr.status == 403 || xhr.status == 200)) {
            if(xhr.status == 403){
                try{
                    var data = xhr.responseText;
                    //以后增加waf检测规则,waf可能会造成结果403
                    callback(url);
                }
                catch(e){
                    //pass
                }
            }
            if(xhr.status == 200){
                try{
                    var data = xhr.responseText;
                    //判断文件200
                    if(data.indexOf("Description</a></th></tr>")!= -1){
                        callback(url);
                    }
                }
                catch(e){
                    //pass
                }
            }
        }
        else{
            callback(false);
        }
    }
    xhr.send();
}

function gitLeak(url,callback){
    var xhr = new XMLHttpRequest();
    url += '/.git/HEAD'
    xhr.open("GET", url);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200 ) {
        	try {
                var data = xhr.responseText;
                if(data.indexOf("ref:") != -1){
                    callback(url);
                }
            }
	        catch(e) {
	        	// pass
	        }
        }
        else{
            callback(false);
        }
    }
    xhr.send();
}

function svnLeak(url,callback){
    var xhr = new XMLHttpRequest();
    url += '/.svn/all-wcprops'
    xhr.open("GET", url);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200 ) {
        	try {
                var data = xhr.responseText;
                if(data.indexOf("svn:wc") != -1){
                    callback(url);
                }
            }
	        catch(e) {
	        	// pass
	        }
        }
        else{
            callback(false);
        }
    }
    xhr.send();
}

function updateBrowserAction(tabId, url) {
	var host = null;
	var hostname;
    console.log(tabId,url);
	if (url.indexOf('http') === -1 && url.indexOf('https') === -1) {
		return;
	}

    hostname = getHostname(url);
    rootUrl = getRoot(url);
	chrome.browserAction.disable(tabId);
    chrome.browserAction.setBadgeText({
		text: ''
    });

	if (hostname1Cache[tabId] && hostname1Cache[tabId] === hostname) {
		if (host1Cache[tabId]) {
			updateHost(tabId);
		}
	}
	else {
        gitLeak(rootUrl,function(gV){
            svnLeak(rootUrl,function(sV){
                hostname1Cache[tabId] = hostname;
                host1Cache[tabId]={};
                host1Cache[tabId]['gitV'] = gV;
                host1Cache[tabId]['svnV'] = sV;
                updateHost(tabId);
            });
        });
        
        //后续增加tp指纹
        if(true){
            logCheck(rootUrl,'/Application/Runtime/Logs',function(log0){
                logCheck(rootUrl,'/Runtime/Logs',function(log1){
                    logCheck(rootUrl,'/runtime/log',function(log2){
                        host1Cache[tabId]['log0'] = log0;
                        host1Cache[tabId]['log1'] = log1; 
                        host1Cache[tabId]['log2'] = log2;
                        updateHost(tabId); 
                    });
                }); 
            });
        }
    }
};

chrome.tabs.onUpdated.addListener(function (id, info, tab) {
	if (tab.status === 'loading') {
        updateBrowserAction(id, tab.url);
	}
});

chrome.tabs.onActivated.addListener(function (activeInfo) {
	if (activeInfo.tabId) {
		chrome.tabs.get(activeInfo.tabId, function (tab) {
			updateBrowserAction(tab.id, tab.url);
		});
	}
});

chrome.tabs.onRemoved.addListener(function (id) {
	delete hostname1Cache[id];
	delete host1Cache[id];
});

chrome.browserAction.disable();
chrome.browserAction.setBadgeBackgroundColor({
	color: '#000'
});