window.onload = function (){
    var bg = chrome.extension.getBackgroundPage();
    var host = bg.getHost();

    if (host){
        items = '';
        document.getElementById('host').innerHTML = host.host;
        if(host.data.gitV){
            items += '<h3>GIT</h3><p><a href="'+host.data.gitV+'" target="_blank">'+host.data.gitV+'</a>';
        }
        if(host.data.svnV){
            items += '<h3>SVN</h3><p><a href="'+host.data.svnV+'" target="_blank">'+host.data.svnV+'</a>';
        }
        if(host.data.log0){
            items += '<h3>log</h3><p><a href="'+host.data.log0+'/Home/20_10_31.log" target="_blank">'+host.data.log0+'</a><p>';
        }
        if(host.data.log1){
            items += '<h3>log</h3><p><a href="'+host.data.log1+'/Home/20_10_31.log" target="_blank">'+host.data.log1+'</a>';
        }
        if(host.data.log2){
            items += '<h3>log</h3><p><a href="'+host.data.log2+'/202010/31.log" target="_blank">'+host.data.log2+'</a>';
        }
        document.getElementById('vu').innerHTML = items;
    }
}