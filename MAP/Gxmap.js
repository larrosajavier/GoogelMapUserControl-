var CONTROL_SMALL_VISIBLE         = 'GSmall_True';
var CONTROL_TYPE_VISIBLE          = 'GType_True';
var CONTROL_OVERVIEW_VISIBLE      = 'GOverviewMap_True';
var CONTROL_LARGE_VISIBLE         = 'GLarge_True';
var CONTROL_SMALL_ZOOM_VISIBLE    = 'GSmallZoom_True';
var CONTROL_SCALE_VISIBLE         = 'GScale_True';
var TYPE_NORMAL                   = 'G_NORMAL_MAP';
var TYPE_SATELLITE                = 'G_SATELLITE_MAP';
var TYPE_HYBRID                   = 'G_HYBRID_MAP';
var TYPE_TERRAIN                  = 'G_TERRAIN_MAP';
var gxmapinstance;
var YAHOO;
var YMAPPID;

function gxMap()
{
	this.GxMap;
	this.OverView_Control;
	this.Small_Zoom_Control;
	this.Large_Control;
	this.MapType_Control_Style;
	this.Navigation_Control_Style;	
	this.Small_Control;
	this.Type_Control;
	this.Scale_Control;	
	this.ClickLatitude;
	this.ClickLongitude;
	this.InformationControl;
	this.getIcon;
	this.Onclick;
	this.CenterWhenClick;
	this.Clear_Overlay;
	this.Icon;
	this.OpenLinksInNewWindow;
	this.ScrollWheel;
	this.Title;
	this.Width;
	this.Height;
	this.Provider;	
	this.Type;
	this.City;
	this.Latitude;
	this.Longitude;
	this.Precision;
	this.BaiduKey;
	this.GoogleApiKey;
	this.Ready = false;
	this.ScriptLoaded = false;
	this.IconWidth;
	this.IconHeigth;
	this.AnchorLeft;
	this.AnchorTop;

	this.SetClickLatitude = function(data)	{		this.ClickLatitude = data;}
	this.GetClickLatitude = function()		{	return this.ClickLatitude;		}
	this.SetClickLongitude = function(data)	{	this.ClickLongitude = data;	}
	this.GetClickLongitude = function()		{	return this.ClickLongitude;	}
	
	this.SetData = function(data){   
		this.GoogleMap = data; 
		if (!this.ScriptLoaded)
		{
			var remoteScripts = [];
			gxmapinstance = this;
			switch(this.Provider)
			{   
				case 'GOOGLE':
					remoteScripts.push("https://maps.google.com/maps/api/js?key=" + this.GoogleApiKey + "&callback=doShowExternal");
					break;
				case 'YAHOO':
					remoteScripts.push('http://us.js2.yimg.com/us.js.yimg.com/lib/common/utils/2/dom_2.0.1-b2.js');
					remoteScripts.push('http://us.js2.yimg.com/us.js.yimg.com/lib/common/utils/2/event_2.0.0-b2.js');
					remoteScripts.push('http://us.js2.yimg.com/us.js.yimg.com/lib/common/utils/2/dragdrop_2.0.1-b4.js');
					remoteScripts.push('http://us.js2.yimg.com/us.js.yimg.com/lib/common/utils/2/animation_2.0.1-b2.js');
					remoteScripts.push('http://us.js2.yimg.com/us.js.yimg.com/lib/map/js/api/ymapapi_3_7_1_10.js');
					
					YAHOO=window.YAHOO||{};
					YAHOO.namespace=function(_1){ 
					if(!_1||!_1.length){ return null; } 
					var _2=_1.split("."); 
					var _3=YAHOO; 
					for(var i=(_2[0]=="YAHOO")?1:0;i<_2.length;++i)
					{ _3[_2[i]]=_3[_2[i]]||{}; _3=_3[_2[i]]; } 
					return _3; 
					}; 

					YAHOO.namespace("util"); 
					YAHOO.namespace("widget"); 
					YAHOO.namespace("example"); 
					YMAPPID = "YpuWfrTV34H0XCOGprbPUfpm5ofYqbUGFUxAd_IozWcbb_xiiWiO0821Kp0oknuY6Q--"; 
					
					break;
				case 'BAIDU':
					remoteScripts.push("//api.map.baidu.com/api?key=" + this.BaiduKey + "&v=1.4&services=true&callback=doShowExternal");
					break;
			}		
			gx.http.loadScripts(remoteScripts, function () { return true; }) 
			this.ScriptLoaded = true;
		}
	}
	
	this.GetData = function()				
	{	
	var data = GetGoogleMapData(this);   
	return data; 
	}


	this.show = function()
	{
		if (!this.IsPostBack)
		{
			if ( this.Provider =='YAHOO')
			{
				YahooShowExternal(gxmapinstance);
			}
		}	
		else
		{
			switch(this.Provider)
			{   
			case 'GOOGLE':
				GoogleShow(gxmapinstance);
				break;
			case 'BAIDU':
				BaiduShow(gxmapinstance);
				break;
			case 'YAHOO':
				YahooShow(gxmapinstance);
				break;
		}	
		}
	}
	
	
	this.doShow = function()
	{
		switch(this.Provider)
		{   
			case 'GOOGLE':
				GoogleShow(gxmapinstance);
				break;
			case 'BAIDU':
				BaiduShow(gxmapinstance);
				break;
		}	
	}
}

function doShowExternal()
{
  gxmapinstance.doShow();
}


function YahooShowExternal(gxmapinstance)
{
   window.setTimeout(function() {
        if (window.YMap) {
            YahooShow(gxmapinstance);
        } else {
            YahooShowExternal(gxmapinstance);
        }
    }, 0.1);

    return  true;
}
