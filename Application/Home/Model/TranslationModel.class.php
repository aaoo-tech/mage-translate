<?php
namespace Home\Model;
use Think\Model;

class TranslationModel extends Model {

    public function gets($_field, $_where, $_order_by, $_options = array()) {
        return $this->where($_where)->order($_order_by)->select();
    }

    //$_params数组(各种语言，remarks,status,website_id,modify)
    public function addTranslate($_params){
        return $this->add($_params);
    }

    public function setTranslate($_params){
        return $this->save($_params);
    }

    public function delTranslate($_tid){
        $save['id'] = intval($_tid);
        $save['status'] = '0';
        return $this->save($save);
    }

    public function getOneTranslate($_tid){
        return $this->where(array('id'=>intval($_tid)))->find();
    }
    
    public function total($_website_id){
        return $this->where(
            array(
                'website_id' => intval($_website_id),
                'status' => 1,
            )
        )->count();
    }
}
?>