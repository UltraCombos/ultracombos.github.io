const S3_BUCKET_URL='https://s3.ap-northeast-2.amazonaws.com/ultracombos.project/';
const LAMBDA_URL='https://i7jlsl23sb.execute-api.ap-northeast-1.amazonaws.com/default';
const GET_APP_LIST_FROM_LAMBDA=`${LAMBDA_URL}/s3_list`;
const DOWLOAD_SCHEME='itms-services://?action=download-manifest&url=';

const GET_PLIST_FROM_LAMBDA=`${LAMBDA_URL}/plist_for_app`;
const GET_PLIST_FROM_N8N='http://nas.ultracombos.com:5678/webhook-test/16/webhook1/test';
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

function createAppListURL(folder, ext, maxKeys){
    return `${GET_APP_LIST_FROM_LAMBDA}?prefix=${encodeURIComponent(folder)}&ext=${encodeURIComponent(ext)}&maxKeys=${maxKeys}`;
}

function getAvailableApp(folder, callback){

    const url=createAppListURL(folder, EXT_TO_FIND, 1000);
    $.ajax({
        url: url,
        method:'GET',
        crossDomain:true,
        cache:false, 
        dataType: 'json', 
        contentType: 'application/json', 
        success:(resp)=>{
            //const list=JSON.parse(resp.body);
            // console.log(list);
            callback(resp);
        },
        error:(resp)=>{
            console.error(resp);
        }
    });

    
}

function parseData(data){
    
    // console.log(data);

    const folders=data.Key.split('/');
    //const name=folders[folders.length-1].split('.')[0].replace('-manifest','');
	var last = folders[folders.length-1];
	last = last.replace(/\.[^/.]+$/, "");
	var splits=last.split('.');	
	const name=splits[splits.length-1].replace('-manifest','');

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
    node.find('#_link').attr('href',`${DOWLOAD_SCHEME}${encodeURIComponent(createPlistURL(url, name))}`);


    $('#_list').append(node);
}

function createPlistURL(url,name){

    return `${GET_PLIST_FROM_LAMBDA}?url=${url}&name=${name}&bundle=${name}`;

}