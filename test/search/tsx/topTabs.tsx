import * as React from 'react';
import BaseComponent from "../../../../baseComponent/baseComponent";
import {observer} from "mobx-react";
import {stores} from "../../../../stores";
import {l} from "../../../../language";
import EntityFiles from "../entityFiles/entityFiles";

@observer
class TopTabs extends BaseComponent<any, any> {
    constructor(props: any) {
        super(props)
    }

    public getRender() {
        return <ul className="nav nav-tabs">
            <li className={stores.entityStore.selectedTab.top === 'baseInfo' ? 'active' : ''}>
                <a onClick={this.toTab.bind(this, 'baseInfo')}>{l('entity.baseInfo','基本信息')}</a>
            </li>
            <li className={stores.entityStore.selectedTab.top === 'tag' ? 'active' : ''}>
                <a onClick={this.toTab.bind(this, 'tag')}>{l('entity.tags','标签')}</a>
            </li>
            {
                stores.entityStore.selectedTabObj.code !== '' &&
                <li className={stores.entityStore.selectedTab.top === stores.entityStore.selectedTabObj.code ? 'active' : ''}>
                    <a onClick={this.toTab.bind(this, stores.entityStore.selectedTabObj.code)}>{stores.entityStore.selectedTabObj.name}</a>
                </li>
            }
            {
                stores.entityStore.canUseHistory() &&
                <li className={stores.entityStore.selectedTab.top === 'history' ? 'active' : ''}>
                    <a onClick={this.toTab.bind(this, 'history')}>{l('entity.history','操作记录')}</a>
                </li>
            }
            {
                stores.configStore.config.techCensorEnable && stores.entityStore.entity.extensions.canEdit &&
                <li className={stores.entityStore.selectedTab.top === 'techCensor' ? 'active' : ''}>
                    <a onClick={this.toTab.bind(this, 'techCensor')}>{l('entity.techCensor','技审信息')}</a>
                </li>
            }
            {
                stores.configStore.config.catalogueEnable &&
                <li className={stores.entityStore.selectedTab.top === 'catalogInfo' ? 'active' : ''}>
                    <a onClick={this.toTab.bind(this, 'catalogInfo')}>{l('entity.catalogInfo','编目信息')}</a>
                </li>
            }
            <EntityFiles/>
        </ul>
    }

    private toTab = (name: string)=>{
        stores.entityStore.changeTopTab(name);
    }
}

export default TopTabs