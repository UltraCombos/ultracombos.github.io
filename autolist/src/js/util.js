const S3_BUCKET_URL='https://s3.ap-northeast-2.amazonaws.com/ultracombos.project/';
const LIST_S3_URL='https://bmxf17dhzg.execute-api.ap-northeast-1.amazonaws.com/default/';
const DOWLOAD_SCHEME='itms-services://?action=download-manifest&url=';

const EXT_TO_FIND='.ipa';

$(document).ready(function(){
    init();
});        

function init(){       
  
  const folder=getFolderFromURL();

  if(folder){
    getAvailableApp(folder, (data)=>{

        $('#_loading').addClass('d-none');
      
          if($.isArray(data) && data.length>0){           
            
            data.forEach(app=>{
                const {project, name, url}=parseData(app);
                createAppNode(project, name, url);
            });

          }else{
            $('#_alert').html(`No app in folder "${folder}"!`);
            $('#_alert').removeClass('d-none');
          }
    });
  }else{
        $('#_loading').addClass('d-none');

        $('#_alert').html('Invalid folder!');
        $('#_alert').removeClass('d-none');
  }

}

function getFolderFromURL(){
    const searchParams = new URLSearchParams(window.location.search)
    if(searchParams.has('folder')) 
        return searchParams.get('folder');
}

function getAvailableApp(folder, callback){
    $.ajax({
        url: LIST_S3_URL,
        method:'POST',
        crossDomain:true,
        cache:false, 
        dataType: 'json', 
        contentType: 'application/json', 
        data:JSON.stringify({
            prefix:folder,
            ext:EXT_TO_FIND,
            maxKeys:1000,
        }),
        success:(resp)=>{
            const list=JSON.parse(resp.body);
            // console.log(list);

            callback(list);
        },
        error:(resp)=>{
            console.error(resp);
        }
    });
}

function parseData(data){
    
    // console.log(data);

    const folders=data.Key.split('/');
    const name=folders[folders.length-1].split('.')[0].replace('-manifest','');

    return {
        project: folders[0],
        name: name,
        url: `${S3_BUCKET_URL}${data.Key}`,
    };
}

function createAppNode(project, name, url){
          
    console.log(`create app node ${project}/${name}`);
    
    var node=$( $('#_template')[0].innerHTML );

    
    const id=`id_${name}`;
    
    node.attr('id',id);          
    node.find('#_label_project').html(project);
    node.find('#_label_app').html(name);
    node.find('#_link').attr('href',`${DOWLOAD_SCHEME}${url}`);

    node.find('#_test_link').click(()=>{
        window.location.href=`${DOWLOAD_SCHEME}${createDynamicFile(url)}`;
    });
    
    $('#_list').append(node);
}

function createDynamicFile(ipa_url,name){

    var contents=`<?xml version="1.0" encoding="UTF-8"?>
    <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
    <plist version="1.0">
    <dict>
        <key>items</key>
        <array>
            <dict>
                <key>assets</key>
                <array>
                    <dict>
                        <key>kind</key>
                        <string>software-package</string>
                        <key>url</key>
                        <string>${ipa_url}</string>
                    </dict>
                </array>
                <key>metadata</key>
                <dict>
                    <key>bundle-identifier</key>
                    <string>com.ultracombos.gm-4-2-1</string>
                    <key>bundle-version</key>
                    <string>1.0.0</string>
                    <key>kind</key>
                    <string>software</string>
                    <key>title</key>
                    <string>${name}</string>
                </dict>
            </dict>
        </array>
    </dict>
    </plist>`;

    var blob=new Blob([contents], {type: "text/plain"});
    var url=window.URL.createObjectURL(blob);

    return url;

}