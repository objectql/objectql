// 从 package.json 导出当前软件包的基本定义

import pkg from '../package.json';

export default {
    
    name: pkg.name,
    version: pkg.version,

    /**
     * Service created lifecycle event handler
     */
    created() {
    },

    /**
     * Service started lifecycle event handler
     */
    async started() {
    },

    /**
     * Service stopped lifecycle event handler
     */
    async stopped() {
    }
}