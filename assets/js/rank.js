
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
        el: "#ranking",
        data: {
            endpoint: "https://graph.4it.top/v1/rank",
            action:'top',
            ranks: [],
            uid: '',
            user:null,
            gid: '1820992344873640',
            error: !1,
            last:'',
            now:'',
            total:0,
            loading: !1,
            ranksUpdated:!1,
            top:50,
            tab:'top',
            m:0,
            mMin:-12,
            fb:!1
        },
        mounted: function () {
            var action,m;
            if(action=$(this.$el).data('action')){
                this.action=action;
            }
            if(m=$(this.$el).data('m')){
                this.m=m;
            }
            if($_GET['m']){
                this.m=$_GET['m'];
            }
            if($_GET['action']){
                this.action=$_GET['action'];
            }
            this.loadRank();
        },
        watch:{
            ranks:function() {
                this.ranksUpdated=true;
            }
        },
        updated: function () {
            this.$nextTick(function () {
                if(this.ranksUpdated){
                    //$('#rankTable').bootstrapTable('destroy');
                    //$('#rankTable').bootstrapTable();
                    //console.log('bs');
                }
            })
        },
        computed:{
            valid:function(){
                return !this.loading&&this.uid;
            },
            heading:function(){
                if(this.tab=='top'){
                    return 'Top '+this.top+' Users'
                }else if(this.user){
                    return this.user.fb_name+"'s Rank";
                }else{
                    return 'No rank';
                }
            },
            prev:function () {
                if(this.loading){
                    return false;
                }
                if(!this.ranks||!this.ranks.length>0){
                    this.mMin=this.m+1;
                    return false;
                }
                if(this.mMin<0){
                    return this.m>this.mMin;
                }
                return true;
            },
            next:function(){
                if(this.loading){
                    return false;
                }
                return this.m<0;
            }

        },
        methods: {
            loadRank: function () {
                this.tab='top';
                this.loading=true;
                this.$http.get(this.endpoint + '/' + this.action + '?gid=' + this.gid+'&m='+this.m).then(function (r) {
                    return r.json();
                }).then(function (r) {
                    this.loading=false;
                    if(r.success) {
                        this.ranks = r.data.data||[];
                        this.last=r.data.last;
                        this.total=r.data.total;
                        this.now=r.data.now;
                    }
                });
            },
            myRank:function(){
                var self=this;
                this.loading=true;
                this.tab='my';
                if(!this.uid){
                    if(this.fb){
                        this.uid = FB.getUserID();
                        if(!this.uid){
                            FB.login(
                                function(response){
                                    if(response.status) {
                                        self.uid=FB.getUserID();
                                        self.myRank();
                                    }
                                }
                            );
                            return ;
                        }
                    }

                }
                this.error=0;
                this.$http.get(this.endpoint + '/me'  + '?gid=' + this.gid+'&uid='+this.uid+'&m='+this.m).then(function (r) {
                    return r.json();
                }).then(function (r) {
                    if(r.success) {
                        this.ranks = r.data.data||[];
                        this.now=r.data.now;
                        this.user=_.findWhere(this.ranks,{is_mine:true});
                    }else{
                        this.error=1;
                    }
                    this.loading=false;
                });
            },
            nextMonth:function(){
                this.m++;
                this.load();
            },
            prevMonth:function(){
                this.m--;
                this.load();
            },
            load:function(){
                if(this.tab=='top'){
                    this.loadRank();
                }
                if(this.tab=='my'){
                    this.myRank();
                }
            }

        }
    })
})();