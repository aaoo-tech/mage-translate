<?php
namespace Home\Controller;
use Think\Controller;
class IndexController extends Controller {
    public function index(){
        $this->show('<style type="text/css">*{ padding: 0; margin: 0; } div{ padding: 4px 48px;} body{ background: #fff; font-family: "微软雅黑"; color: #333;font-size:24px} h1{ font-size: 100px; font-weight: normal; margin-bottom: 12px; } p{ line-height: 1.8em; font-size: 36px } a,a:hover,{color:blue;}</style><div style="padding: 24px 48px;"> <h1>:)</h1><p>欢迎使用 <b>ThinkPHP</b>！</p><br/>版本 V{$Think.version}</div><script type="text/javascript" src="http://ad.topthink.com/Public/static/client.js"></script><thinkad id="ad_55e75dfae343f5a1"></thinkad><script type="text/javascript" src="http://tajs.qq.com/stats?sId=9347272" charset="UTF-8"></script>','utf-8');
    }
    // public function verify(){
    //     $Verify = new \Think\Verify();
    //     $Verify->entry();
    // }
    public function test(){
        $_translate = D('translation')->where(array('website_id' => session('website_id')))->relation(true)->select();
        foreach ($_translate as $k => $val) {
            # code...
            $_translate[$k]['other_translate']['de_de'] = $val['de'];
            $_translate[$k]['other_translate']['nl_nl'] = $val['nl'];
        }
        var_dump($_translate);
        die();
        foreach ($_translate as $k => $val) {
            # code...
            $_base_add['content'] = $val['en'];
            $_base_add['website_id'] = $val['website_id'];
            $_base_add['remarks'] = $val['remarks'];
            $_base_add['status'] = $val['status'];
            $_base_add['modify'] = $val['modify'];
            $_base_id = D('base_translate')->add($_base_add);
            foreach ($val['other_translate'] as $key => $other) {
                # code...
                $_language = D('language')->where(array('simple_name' => $key))->find();
                $_other_add['lang_id'] = $_language['id'];
                $_other_add['content'] = $other;
                $_other_add['base_id'] = $_base_id;
                D('other_translate')->add($_other_add);
            }
            foreach ($val['translation_image'] as $image) {
                # code...
                // $_save['id'] = $image['id'];
                // $_save['lang_id'] = $_base_id;
                // D('translation_image')->save($_save);
                $_image_add['lang_id'] = $_base_id;
                $_image_add['image_name'] = $image['image_name'];
                $_image_add['status'] = $image['status'];
                D('translation_image')->add($_image_add);
            }
        }
        
    }
}