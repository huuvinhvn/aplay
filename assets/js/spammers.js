
var rank;
function queryStrings($var){
    var queries = {};
    document.location.search.substr(1).split('&').forEach(function(c){
        var i = c.split('=');
        if(i.length>0 && i[0]) {
            queries[i[0].toString()] = i[1]?i[1].toString():null;
        }
    });
    window.$_GET=queries;
}queryStrings();
(function () {
    var ranksUpdated;
    rank=new Vue({
        el: "#spams-list",
        data: {
            endpoint: "https://graph.4it.top/v1/spam",
            items: [],
            uid: '',
            q:'',
            user:null,
            gid: '1820992344873640',
            error: !1,
            page:1,
            maxPages:1,
            total:0,
            from:0,
            to:0,
            loading: !1,
            tab:'all',
            fb:!1
        },
        mounted: function () {
            if($_GET['uid']){
                this.tab='custom';
                this.uid=$_GET['uid'];
            }
            if($_GET['q']){
                this.q=$_GET['q'];
            }
            this.loadData();
        },
        computed:{
            valid:function(){
                return !this.loading&&this.uid;
            },
            heading:function(){
                if(this.tab==='all'){
                    return 'All Spams'
                }else if(this.uid){
                    if(this.tab==='my'){
                        return 'Spam của tôi';
                    }
                    return 'Những spam của '+this.user
                }else{
                    return 'Tuyệt vời, không có spam nào!';
                }
            },
            prev:function () {
                if(this.loading){
                    return false;
                }
                return this.page>1;
            },
            next:function(){
                if(this.loading){
                    return false;
                }
                return this.page<this.maxPages;
            }

        },
        methods: {
            allSpam:function(){
                this.tab='all';
                this.uid='';
                this.loadData();
            },
            loadData: function () {
                this.loading=true;
                this.$http.get(this.endpoint + '/' + this.gid+'?page='+this.page+'&uid='+this.uid+'&q='+this.q).then(function (r) {
                    return r.json();
                }).then(function (r) {
                    this.loading=false;

                    this.items = r.data||[];
                    if(this.items.length>0){
                        this.user=this.items[0].fb_name;
                    }else{
                        this.user=this.uid;
                    }
                    this.maxPages=r.last_page;
                    this.total=r.total;
                    this.from=r.from;
                    this.to=r.to;

                });
            },
            mySpam:function(){
                var self=this;
                this.loading=true;
                if(this.tab==='custom') {
                    this.uid='';
                }
                this.tab='my';
                if(!this.uid){
                    if(this.fb){
                        this.uid = FB.getUserID();
                        if(!this.uid){
                            FB.login(
                                function(response){
                                    if(response.status) {
                                        self.uid=FB.getUserID();
                                        self.mySpam();
                                    }
                                }
                            );
                            return ;
                        }
                    }

                }
                this.loadData();

            },
            goNext:function(){
                this.page++;
                this.load();
            },
            goBack:function(){
                this.page--;
                this.load();
            },
            load:function(){
                this.loadData();
            }

        }
    })
})();