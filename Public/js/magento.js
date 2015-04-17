'use strict';
var self = this;
if (Backbone.emulateJSON) {
    params.contentType = 'application/x-www-form-urlencoded';
    params.data = params.data ? {model: params.data} : {};
}

jQuery(function() {
    (function(){
        var root = this;
        var cms;
        cms = root.cms = {};
        var _ = root._,
        $ = root.jQuery;

        cms.Model = {};
        cms.Collection = {};
        cms.View = {};

        cms.Model.Base = Backbone.Model.extend({
            defaults:{
                'timestamp':-1
            },
            save: function(attributes, options) {
                $.fancybox.showLoading();
                var _success = options.success;
                options.success = function(resp) {
                    $.fancybox.hideLoading();
                    if (_success) _success(model, resp, options);
                };
                return Backbone.Model.prototype.save.call(this, attributes, options);
            }
        });

        var CmsRouter = Backbone.Router.extend({
            initialize: function(options){
                options || (options = {});
                this._cmsEvents = options._cmsEvents;
            },
            routes: {
                "page": "pageRender",
                "block": "blockRender",
                "edit-page/:id\d": "eidtPage",
                "edit-block/:id\d": "editBlock",
            },

            pageRender: function(){
                $('.block-cms-sidebar ul li').removeClass('menu-selection');
                $('.block-cms-sidebar ul li:eq(0)').addClass('menu-selection');
                this._cmsEvents.trigger('refresh', 'page-view');
                $('.block-cms-page').show();
                $('.block-cms-block').hide();
                // console.log('page');
            },
            blockRender: function(){
                $('.block-cms-sidebar ul li').removeClass('menu-selection');
                $('.block-cms-sidebar ul li:eq(1)').addClass('menu-selection');
                this._cmsEvents.trigger('refresh', 'block-view');
                $('.block-cms-block').show();
                $('.block-cms-page').hide();
                // console.log('block');
            },
            eidtPage: function (id){
                console.log(id);
                this._cmsEvents.trigger('alernately',{cms_id:id},'storePage');
            },
            editBlock: function (id){
                console.log(id);
                this._cmsEvents.trigger('alernately',{cms_id:id},'storeBlock');
            }
        });

        cms.View.CmsPageSearchView = Backbone.View.extend({
            template: _.template($('#tpl-cms-page-search').html()),
            events:{
                'keypress .page-search': 'searchPage',
                'focus .page-search': 'searchFocus',
                'click .search-clear': 'searchClear',
                'click .search-enter': 'searchEnter'
            },
            searchPage: function (event){
                if(event.keyCode == 13){
                    $(event.target).blur();
                    $('.search-enter').hide();
                    $('.search-clear').show();
                    var page_search = $(event.target).val();
                    // console.log(this.$el.attr("type-list"));
                    this._cmsEvents.trigger('alernately',{page_search: page_search},'cmsPages');
                }
            },
            searchFocus: function (event){
                $('.search-enter').show();
                $('.search-clear').hide();
            },
            searchClear: function (event){
                $('.page-search').val('');
                $('.page-search').focus();
                this._cmsEvents.trigger('alernately',{page_search: ''},'cmsPages');
                $('.search-enter').show();
                $('.search-clear').hide();
                return false;
            },
            searchEnter: function (event){
                $('.search').blur();
                $('.search-enter').hide();
                $('.search-clear').show();
                this.search = $('.page-search').val();
                this._cmsEvents.trigger('alernately',{page_search: this.search},'cmsPages');
                return false;
            },
            initialize: function(options){
                options || (options = {});
                this.cmsModel = options.cmsModel;
                this._cmsEvents = options._cmsEvents;
                this.render();
            },
            render: function(){
                var data = {};
                this.$el.html(this.template(data));
                return this;
            }
        });

        // cms.View.StorePageSearch = Backbone.View.extend({
        //     template: _.template($('#tpl-store-page-search').html()),
        //     events: {
        //         'keypress .store-page-search': 'searchStorePage'
        //     },
        //     searchStorePage: function (event){
        //         if(event.keyCode == 13){
        //             var store_page_search = $(event.target).val();
        //             console.log(store_page_search);
        //         }
        //     },
        //     initialize: function(options){
        //         options || (options = {});
        //         this.cmsModel = options.cmsModel;
        //         this._cmsEvents = options._cmsEvents;
        //         // this.render();
        //     },
        //     render: function(){
        //         var data = {};
        //         this.$el.html(this.template(data));
        //         return this;
        //     }
        // });

        cms.View.CmsPageListView = Backbone.View.extend({
            template: _.template($('#tpl-cms-page-list').html()),
            events:{
                // 'click tbody tr': 'storePages',
                // 'click .btn-edit-page': 'storePage',
                'click .btn-page-translate': 'syncToTranslate',
                'click .btn-page-magento': 'syncToMagento',
                'change .batch-app': 'appPage',
                'click .btn-export-txt': 'exportContent'
            },
            storePage: function (event){
                 if(PurviewVal() == '-1' || Purview('update') == '1'){
                    var cms_id = $(event.target).closest('tr').data("id");
                    this._cmsEvents.trigger('alernately',{cms_id:cms_id},'storePage');
                }else{
                    $.fancybox($('.message'),{
                       afterClose: function () {
                            // window.history.back();
                        }
                    });
                }
                return false;
            },
            // storePages: function (event){
            //     var identifier = $(event.target).closest('tr').data("identifier");
            //     console.log(identifier);
            //     $('.block-cms-page-list').hide();
            //     this._cmsEvents.trigger('alernately',{identifier:identifier},'storePages');
            //     $('.search-cms-page').attr('type-list', 'store_page');
            //     return false;
            // },
            syncToTranslate: function (event){
                if(PurviewVal() == '-1' || Purview('update') == '1' || Purview('create') == '1'){
                    this.cmsModel.clear();
                    $(event.target).closest('a').removeClass('btn-page-translate');
                    $('.btn-page-magento').removeClass('btn-block-magento');
                    var _self = this;
                    // this.test = $(event.target).closest('div');
                    // console.log(this.test);
                    this.cmsModel.save({}, 
                        {url: UrlApi('_app')+'/MagentoApi/syncTranslatePage'}
                    ).done(function (response){
                        if (response.success === true) {
                            // console.log(_self.test);
                            _self.$el.notify(
                                'Success',
                                {
                                    position: 'top',
                                    className: 'success'
                                }
                            );
                            // setTimeout(_self.render(),10000);
                            _self.render();
                        } else {
                            _self.$el.notify(
                                'Failure',
                                {
                                    position: 'top',
                                    className: 'error'
                                }
                            );
                        }
                    });
                }else{
                    $.fancybox($('.message'),{
                       afterClose: function () {
                            // window.history.back();
                        }
                    });
                }
                // this.cmsModel.clear();
                return false;
            },
            syncToMagento: function (event){
                if(PurviewVal() == '-1' || Purview('update') == '1'){
                    this.cmsModel.clear();
                    $(event.target).closest('a').removeClass('btn-page-magento');
                    $('.btn-page-translate').removeClass('btn-page-translate');
                    var _self = this;
                    this.cmsModel.save({}, 
                        {url: UrlApi('_app')+'/MagentoApi/syncMagentoPage'}
                    ).done(function (response){
                        if (response.success === true) {
                            _self.$el.notify(
                                'Success',
                                {
                                    position: 'top',
                                    className: 'success'
                                }
                            );
                            _self.render();
                        } else {
                            _self.$el.notify(
                                'Failure',
                                {
                                    position: 'top',
                                    className: 'error'
                                }
                            );
                        }
                    });
                }else{
                    $.fancybox($('.message'),{
                       afterClose: function () {
                            // window.history.back();
                        }
                    });
                }
                // this.cmsModel.clear();
                return false;
            },
            appPage: function (event){
                this.cmsModel.clear();
                // this.operation = $(event.target).val();
                var _self = this;
                this.data = {};
                this.operation = $(event.target).val();
                // console.log(this.operation);
                if($('.block-cms-page-list tbody input:checked').length < 1){
                    return;
                }
                $('.block-cms-page-list tbody input:checked').each(function (i){
                    _self.data[i] = $(this).val();
                });
                // console.log(this.data);
                if(this.operation == 'download'){
                    if(PurviewVal() == '-1' || Purview('export') == '1'){
                        this.cmsModel.save(
                            {page_ids: this.data, type: 1},
                            {url: UrlApi('_app')+"/MagentoCms/cmsExportZip"}
                        ).done(function (response){
                            if(response.success === true){
                                _self.$el.notify(
                                    'Success',
                                    {
                                        position: 'top',
                                        className: 'success'
                                    }
                                );
                                window.open(UrlApi('_app')+'/MagentoCms/downloadZip');
                                $(event.target).find('option')[0].selected = true;
                                _self.render();
                            }else{
                                _self.$el.notify(
                                    'Failure',
                                    {
                                        position: 'top',
                                        className: 'error'
                                    }
                                );
                            }
                        });
                    }else{
                        $.fancybox($('.message'),{
                           afterClose: function () {
                                // window.history.back();
                            }
                        });
                    }
                    // this.cmsModel.clear();
                }
                if(this.operation == 'magento'){
                    if(PurviewVal() == '-1' || Purview('update') == '1'){
                        if(confirm('Are you sure update to magento?') == true){
                            this.cmsModel.save(
                                {page_ids: this.data},
                                {url: UrlApi('_app')+"/MagentoApi/syncSelectPage"}
                            ).done(function (response){
                                if(response.success === true){
                                    _self.$el.notify(
                                        'Success',
                                        {
                                            position: 'top',
                                            className: 'success'
                                        }
                                    );
                                    $(event.target).find('option')[0].selected = true;
                                    _self.render();
                                }else{
                                    _self.$el.notify(
                                        'Failure',
                                        {
                                            position: 'top',
                                            className: 'error'
                                        }
                                    );
                                }
                            });
                            // this.cmsModel.clear();
                        }else{
                            $(event.target).find('option')[0].selected = true;
                        }
                    }else{
                        $.fancybox($('.message'),{
                           afterClose: function () {
                                // window.history.back();
                            }
                        });
                    }
                }
            },
            exportContent: function (event){
                if(PurviewVal() == '-1' || Purview('export') == '1'){
                    this.cmsModel.clear();
                    var cms_id = $(event.target).closest('tr').data("id");
                    this.cmsModel.save(
                        {cms_id: cms_id},
                        {url: UrlApi('_app')+"/MagentoCms/cmsExport"}
                    ).done(function (response){
                        if(response.success === true){
                            window.open(UrlApi('_app')+'/MagentoCms/downloadTxt');
                        }
                    });
                }else{
                    $.fancybox($('.message'),{
                       afterClose: function () {
                            // window.history.back();
                        }
                    });
                }
                // this.cmsModel.clear();
                return false;
            },
            setCmsPageSerach: function(data){
                this.page_search = data.page_search;
                // console.log(this.page_search);
                return this;
            },
            initialize: function(options){
                options || (options = {});
                this.cmsModel = options.cmsModel;
                this._cmsEvents = options._cmsEvents;
                this.render();
            },
            render: function(){
                this.cmsModel.clear();
                var _self = this;
                this.cmsModel.save(
                    {page_search: this.page_search},
                    {url:UrlApi('_app')+'/MagentoCms/getPages'}
                ).done(function (response){
                    // console.log(response.data);
                    var data = {};
                    data['page_list'] = response.data.list;
                    data['pages_total'] = response.data.total;
                    data['pages_count'] = response.data.count;
                    _self.$el.html(_self.template(data));
                });
                // this.cmsModel.clear();
                // return this;
            }
        });

        // cms.View.StoreCmsPageListView = Backbone.View.extend({
        //     template: _.template($('#tpl-store-cms-page-list').html()),
        //     events:{
        //         'click tbody tr': 'storePage'
        //     },
        //     storePage: function (event){
        //         var cms_id = $(event.target).closest('tr').data("id");
        //         console.log(cms_id);
        //         this._cmsEvents.trigger('alernately',{cms_id:cms_id},'storePage');
        //         return false;
        //     },
        //     initialize: function(options){
        //         options || (options = {});
        //         this.cmsModel = options.cmsModel;
        //         this._cmsEvents = options._cmsEvents;
        //         // this.render();
        //     },
        //     setStorePageList: function(data){
        //         this.identifier = data.identifier;
        //         return this;
        //     },
        //     render: function(){
        //         var _self = this;
        //         this.cmsModel.save(
        //             {identifier: this.identifier},
        //             {url:UrlApi('_app')+'/MagentoCms/getStorePages'}
        //         ).done(function (response){
        //             console.log(response.data);
        //             var data = {};
        //             data['store_page_list'] = response.data.store_pages;
        //             data['store_pages_total'] = response.data.total;
        //             _self.$el.html(_self.template(data));
        //         });
        //         this.cmsModel.clear();
        //         return this;
        //     }
        // });

        cms.View.CmsPageView = Backbone.View.extend({
            template: _.template($('#tpl-store-cms-page').html()),
            events: {
                'click .btn-save-page': 'clickBtnPageSave'
            },
            _save: function(){
                this.cmsModel.clear();
                var _self = this;
                var $form = this.$el.find('form');
                // console.log($form.serializeObject());
                this.cmsModel.save(
                    $form.serializeObject(),
                    {url:UrlApi('_app')+'/MagentoCms/saveStorePage'}
                ).done(function (response){
                    if (response.success === true) {
                        $form.notify(
                            'Success',
                            {
                                position: 'top',
                                className: 'success'
                            }
                        );
                        _self._cmsEvents.trigger('refresh', 'page-view');
                    } else {
                        $form.notify(
                            response.message,
                            {
                                position: 'top',
                                className: 'error'
                            }
                        );
                    }
                });
                // this.cmsModel.clear();
            },
            clickBtnPageSave: function(event){
                $(event.target).closest('form').submit();
                return false;
            },
            initialize: function(options){
                options || (options = {});
                this.cmsModel = options.cmsModel;
                this._cmsEvents = options._cmsEvents;
                // this.render();
            },
            setStorePage: function(data){
                this.cms_id = data.cms_id;
                return this;
            },
            render: function(){
                this.cmsModel.clear();
                var _self = this;
                this.cmsModel.save(
                    {cms_id: this.cms_id},
                    { url: UrlApi('_app')+'/MagentoCms/getStorePage' }
                ).done(function (response){
                    var data = {};
                    data['store_page'] = response.data;
                    // console.log(data);
                    _self.$el.html(_self.template(data));
                    _self.$el.find('form').validator().on('submit', function(e) {
                        if (e.isDefaultPrevented()) {
                        } else {
                            _self._save.call(_self);
                            return false;
                        }
                    });
                    $.fancybox(_self.$el, {
                       afterClose: function () {
                            window.history.back();
                        }
                    });
                });
                // this.cmsModel.clear();
                return this;
            }
        });

        // cms.View.CmsBlockTestView = Backbone.View.extend({});

        cms.View.CmsBlockSearchView = Backbone.View.extend({
            template: _.template($('#tpl-cms-block-search').html()),
            events:{
                'keypress .block-search': 'searchBlock',
                'focus .block-search': 'searchFocus',
                'click .search-clear': 'searchClear',
                'click .search-enter': 'searchEnter'
            },
            searchBlock: function (event){
                if(event.keyCode == 13){
                    $(event.target).blur();
                    $('.search-enter').hide();
                    $('.search-clear').show();
                    var block_search = $(event.target).val();
                    // console.log(this.$el.attr("type-list"));
                    this._cmsEvents.trigger('alernately',{block_search: block_search},'cmsBlocks');
                }
            },
            searchFocus: function (event){
                $('.search-enter').show();
                $('.search-clear').hide();
            },
            searchClear: function (event){
                $('.block-search').val('');
                $('.block-search').focus();
                this._cmsEvents.trigger('alernately',{block_search: ''},'cmsBlocks');
                $('.search-enter').show();
                $('.search-clear').hide();
                return false;
            },
            searchEnter: function (event){
                $('.search').blur();
                $('.search-enter').hide();
                $('.search-clear').show();
                this.search = $('.block-search').val();
                this._cmsEvents.trigger('alernately',{block_search: this.search},'cmsBlocks');
                return false;
            },
            initialize: function(options){
                options || (options = {});
                this.cmsModel = options.cmsModel;
                this._cmsEvents = options._cmsEvents;
                // this.render();
            },
            render: function(){
                var data = {};
                this.$el.html(this.template(data));
                return this;
            }
        });

        cms.View.CmsBlockListView = Backbone.View.extend({
            template: _.template($('#tpl-cms-block-list').html()),
            events:{
                // 'click tbody tr': 'storeBlocks',
                // 'click .btn-edit-block': 'storeBlock',
                'click .btn-block-translate': 'syncToTranslate',
                'click .btn-block-magento': 'syncToMagento',
                'change .batch-app': 'appBlock',
                'click .btn-export-txt': 'exportContent'
            },
            storeBlock: function (event){
                if(PurviewVal() == '-1' || Purview('update') == '1'){
                    var cms_id = $(event.target).closest('tr').data("id");
                    this._cmsEvents.trigger('alernately',{cms_id:cms_id},'storeBlock');
                }else{
                    $.fancybox($('.message'),{
                       afterClose: function () {
                            // window.history.back();
                        }
                    });
                }
                return false;
            },
            // storeBlocks: function (event){
            //     var identifier = $(event.target).closest('tr').data("identifier");
            //     console.log(identifier);
            //     $('.block-cms-block-list').hide();
            //     this._cmsEvents.trigger('alernately',{identifier:identifier},'storeBlocks');
            //     // $('.search-cms-page').attr('type-list', 'store_page');
            //     return false;
            // },
            syncToTranslate: function (event){
                if(PurviewVal() == '-1' || Purview('update') == '1' || Purview('create') == '1'){
                    this.cmsModel.clear();
                    $(event.target).closest('a').removeClass('btn-block-translate');
                    $('.btn-block-magento').removeClass('btn-block-magento');
                    var _self = this;
                    this.cmsModel.save({}, 
                        {url: UrlApi('_app')+'/MagentoApi/syncTranslateBlock'}
                    ).done(function (response){
                        if (response.success === true) {
                            _self.$el.notify(
                                'Success',
                                {
                                    position: 'top',
                                    className: 'success'
                                }
                            );
                            _self.render();
                        } else {
                            _self.$el.notify(
                                'Failure',
                                {
                                    position: 'top',
                                    className: 'error'
                                }
                            );
                        }
                    });
                }else{
                    $.fancybox($('.message'),{
                       afterClose: function () {
                            // window.history.back();
                        }
                    });
                }
                // this.cmsModel.clear();
                return false;
            },
            syncToMagento: function (event){
                if(PurviewVal() == '-1' || Purview('update') == '1'){
                    this.cmsModel.clear();
                    $(event.target).closest('a').removeClass('btn-block-magento');
                    $('.btn-block-translate').removeClass('btn-block-translate');
                    var _self = this;
                    this.cmsModel.save({}, 
                        {url: UrlApi('_app')+'/MagentoApi/syncMagentoBlock'}
                    ).done(function (response){
                        if (response.success === true) {
                            _self.$el.notify(
                                'Success',
                                {
                                    position: 'top',
                                    className: 'success'
                                }
                            );
                            _self.render();
                        } else {
                            _self.$el.notify(
                                'Failure',
                                {
                                    position: 'top',
                                    className: 'error'
                                }
                            );
                        }
                    });
                }else{
                    $.fancybox($('.message'),{
                       afterClose: function () {
                            // window.history.back();
                        }
                    });
                }
                // this.cmsModel.clear();
                return false;
            },
            appBlock: function (event){
                this.cmsModel.clear();
                var _self = this;
                this.data = {};
                this.operation = $(event.target).val();
                // console.log($(event.target).parents('.block'));
                if($('.block-cms-block-list tbody input:checked').length < 1){
                    return;
                }
                $('.block-cms-block-list tbody input:checked').each(function (i){
                    _self.data[i] = $(this).val();
                });
                // console.log(this.data);
                if(this.operation == 'download'){
                    if(PurviewVal() == '-1' || Purview('export') == '1'){
                        console.log(this.data);
                        this.cmsModel.save(
                            {page_ids: this.data, type: 2},
                            {url: UrlApi('_app')+"/MagentoCms/cmsExportZip"}
                        ).done(function (response){
                            if(response.success === true){
                                _self.$el.notify(
                                    'Success',
                                    {
                                        position: 'top',
                                        className: 'success'
                                    }
                                );
                                window.open(UrlApi('_app')+'/MagentoCms/downloadZip');
                                $(event.target).find('option')[0].selected = true;
                                _self.render();
                            }else{
                                _self.$el.notify(
                                    'Failure',
                                    {
                                        position: 'top',
                                        className: 'error'
                                    }
                                );
                            }
                        });
                    }else{
                        $.fancybox($('.message'),{
                           afterClose: function () {
                                // window.history.back();
                            }
                        });
                    }
                    // this.cmsModel.clear();
                }

                if(this.operation == 'magento'){
                    if(PurviewVal() == '-1' || Purview('update') == '1'){
                        if(confirm('Are you sure update to magento?') == true){
                            this.cmsModel.save(
                                {block_ids: this.data},
                                {url: UrlApi('_app')+"/MagentoApi/syncSelectBlock"}
                            ).done(function (response){
                                if (response.success === true) {
                                    _self.$el.notify(
                                        'Success',
                                        {
                                            position: 'top',
                                            className: 'success'
                                        }
                                    );
                                    $(event.target).find('option')[0].selected = true;
                                    _self.render();
                                } else {
                                    _self.$el.notify(
                                        'Failure',
                                        {
                                            position: 'top',
                                            className: 'error'
                                        }
                                    );
                                }
                            });
                            // this.cmsModel.clear();
                        }else{
                            $(event.target).find('option')[0].selected = true;
                        }
                    }else{
                        $.fancybox($('.message'),{
                           afterClose: function () {
                                // window.history.back();
                            }
                        });
                    }
                }
            },
            exportContent: function (event){
                if(PurviewVal() == '-1' || Purview('export') == '1'){
                    this.cmsModel.clear();
                    var cms_id = $(event.target).closest('tr').data("id");
                    this.cmsModel.save(
                        {cms_id: cms_id},
                        {url: UrlApi('_app')+"/MagentoCms/cmsExport"}
                    ).done(function (response){
                        if(response.success === true){
                            window.open(UrlApi('_app')+'/MagentoCms/downloadTxt');
                        }
                    });
                }else{
                    $.fancybox($('.message'),{
                       afterClose: function () {
                            // window.history.back();
                        }
                    });
                }
                // this.cmsModel.clear();
                return false;
            },
            setCmsBlockSerach: function(data){
                this.block_search = data.block_search;
                // console.log(this.block_search);
                return this;
            },
            initialize: function(options){
                options || (options = {});
                this.cmsModel = options.cmsModel;
                this._cmsEvents = options._cmsEvents;
                // this.render();
            },
            render: function(){
                this.cmsModel.clear();
                var _self = this;
                this.cmsModel.save(
                    {block_search: this.block_search},
                    {url:UrlApi('_app')+'/MagentoCms/getBlocks'}
                ).done(function (response){
                    // console.log(response.data);
                    var data = {};
                    data['block_list'] = response.data.list;
                    data['blocks_total'] = response.data.total;
                    data['blocks_count'] = response.data.count;
                    _self.$el.html(_self.template(data));
                });
                // this.cmsModel.clear();
                return this;
            }
        });

        // cms.View.StoreCmsBlockListView = Backbone.View.extend({
        //     template: _.template($('#tpl-store-cms-block-list').html()),
        //     events:{
        //         'click tbody tr': 'storeBlock'
        //     },
        //     storeBlock: function (event){
        //         var cms_id = $(event.target).closest('tr').data("id");
        //         console.log(cms_id);
        //         this._cmsEvents.trigger('alernately',{cms_id:cms_id},'storeBlock');
        //         return false;
        //     },
        //     initialize: function(options){
        //         options || (options = {});
        //         this.cmsModel = options.cmsModel;
        //         this._cmsEvents = options._cmsEvents;
        //         // this.render();
        //     },
        //     setStoreBlockList: function(data){
        //         this.identifier = data.identifier;
        //         return this;
        //     },
        //     render: function(){
        //         var _self = this;
        //         this.cmsModel.save(
        //             {identifier: this.identifier},
        //             {url:UrlApi('_app')+'/MagentoCms/getStoreBlocks'}
        //         ).done(function (response){
        //             console.log(response.data);
        //             var data = {};
        //             data['store_block_list'] = response.data.store_blocks;
        //             data['store_blocks_total'] = response.data.total;
        //             _self.$el.html(_self.template(data));
        //         });
        //         this.cmsModel.clear();
        //         return this;
        //     }
        // });

        cms.View.CmsBlockView = Backbone.View.extend({
            template: _.template($('#tpl-store-cms-block').html()),
            events: {
                'click .btn-save-block': 'clickBtnBlockSave'
            },
            _save: function(){
                this.cmsModel.clear();
                var _self = this;
                var $form = this.$el.find('form');
                // console.log($form.serializeObject());
                // alert('1');
                this.cmsModel.save(
                    $form.serializeObject(),
                    {url:UrlApi('_app')+'/MagentoCms/saveStoreBlock'}
                ).done(function (response){
                    if (response.success === true) {
                        $form.notify(
                            'Success',
                            {
                                position: 'top',
                                className: 'success'
                            }
                        );
                        _self._cmsEvents.trigger('refresh', 'block-view');
                    } else {
                        $form.notify(
                            response.message,
                            {
                                position: 'top',
                                className: 'error'
                            }
                        );
                    }
                });
                // this.cmsModel.clear();
            },
            clickBtnBlockSave: function(event){
                $(event.target).closest('form').submit();
                return false;
            },
            initialize: function(options){
                options || (options = {});
                this.cmsModel = options.cmsModel;
                this._cmsEvents = options._cmsEvents;
                // this.render();
            },
            setStoreBlock: function(data){
                this.cms_id = data.cms_id;
                return this;
            },
            render: function(){
                this.cmsModel.clear();
                var _self = this;
                this.cmsModel.save(
                    {cms_id: this.cms_id},
                    { url: UrlApi('_app')+'/MagentoCms/getStoreBlock' }
                ).done(function (response){
                    var data = {};
                    data['store_block'] = response.data;
                    // console.log(data);
                    _self.$el.html(_self.template(data));
                    _self.$el.find('form').validator().on('submit', function(e) {
                        if (e.isDefaultPrevented()) {
                        } else {
                            _self._save.call(_self);
                            return false;
                        }
                    });
                    $.fancybox(_self.$el, {
                       afterClose: function () {
                            // window.history.back();
                        }
                    });
                });
                // this.cmsModel.clear();
                return this;
            }
        });

        cms.View.CmsApp = Backbone.View.extend({
            initialize: function(options){
                options || (options = {});
                this.cmsModel = options.cmsModel;

                var _cmsEvents = {};
                _.extend(_cmsEvents, Backbone.Events);

                var pagesearchView = new cms.View.CmsPageSearchView({
                    el: '.search-cms-page',
                    cmsModel: this.cmsModel,
                    _cmsEvents: _cmsEvents
                });

                var blocksearchView = new cms.View.CmsBlockSearchView({
                    el: '.search-cms-block',
                    cmsModel: this.cmsModel,
                    _cmsEvents: _cmsEvents
                });

                // var storepagesearchView = new cms.View.StorePageSearch({
                //     el: '.search-store-page',
                //     cmsModel: this.cmsModel,
                //     _cmsEvents: _cmsEvents
                // });

                var pagelistView = new cms.View.CmsPageListView({
                    el: '.block-cms-page-list',
                    cmsModel: this.cmsModel,
                    _cmsEvents: _cmsEvents
                });

                var blocklistView = new cms.View.CmsBlockListView({
                    el: '.block-cms-block-list',
                    cmsModel: this.cmsModel,
                    _cmsEvents: _cmsEvents
                });

                // var storepagelistView = new cms.View.StoreCmsPageListView({
                //     el: '.block-store-cms-page-list',
                //     cmsModel: this.cmsModel,
                //     _cmsEvents: _cmsEvents
                // });

                // var storeblocklistView = new cms.View.StoreCmsBlockListView({
                //     el: '.block-store-cms-block-list',
                //     cmsModel: this.cmsModel,
                //     _cmsEvents: _cmsEvents
                // });

                var cmspageView = new cms.View.CmsPageView({
                    el: '.block-store-cms-page',
                    cmsModel: this.cmsModel,
                    _cmsEvents: _cmsEvents
                });

                var cmsblockView = new cms.View.CmsBlockView({
                    el: '.block-store-cms-block',
                    cmsModel: this.cmsModel,
                    _cmsEvents: _cmsEvents
                });

                var router = new CmsRouter({
                    _cmsEvents: _cmsEvents
                });

                _cmsEvents.on('refresh', function(view) {
                    switch(view) {
                        case 'page-view':
                            pagesearchView.render();
                            pagelistView.render();
                            break;
                        case 'block-view':
                            blocksearchView.render();
                            blocklistView.render();
                            break;
                    }
                });
                _cmsEvents.on('alernately', function (data,view){
                    switch (view)
                    {
                        // case 'storePages':
                        //     storepagelistView.setStorePageList(data).render();
                        //     break;
                        case 'storePage':
                            cmspageView.setStorePage(data).render();
                            break;
                        case 'cmsPages':
                            pagelistView.setCmsPageSerach(data).render();
                            break;

                        // case 'storeBlocks':
                        //     storeblocklistView.setStoreBlockList(data).render();
                        //     break;
                        case 'storeBlock':
                            cmsblockView.setStoreBlock(data).render();
                            break;
                        case 'cmsBlocks':
                            blocklistView.setCmsBlockSerach(data).render();
                            break;
                    }
                });
            }
        });

        var cmsApp = new cms.View.CmsApp({
            cmsModel: new cms.Model.Base()
        });
        Backbone.history.start();

    }).call(self);

});
