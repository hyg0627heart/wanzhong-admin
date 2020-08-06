<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row :gutter="20">
        <el-col :span="6">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodsList">
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- 表格内容 -->
      <el-table :data="goodsList" border stripe>
        <el-table-column type="expand">
          <template slot-scope>
            <el-table :data="data" style="width: 100%">
              <el-table-column prop="prop" label="label" width="width"></el-table-column>
            </el-table>
          </template>
        </el-table-column>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="商品图片" prop="goods_image">
          <template slot-scope="scope">
            <el-image style="width: 100px; height: 100px" :src="scope.row.goods_image" fit="fill"></el-image>
          </template>
        </el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column label="商家名称" prop="shop.name"></el-table-column>
        <!-- <el-table-column label="商家链接" prop="goods_name"></el-table-column> -->
        <el-table-column label="商品SKU" prop="goods_sku"></el-table-column>
        <!-- <el-table-column label="商品前台价" prop="goods_name"></el-table-column>
        <el-table-column label="商品券后价" prop="goods_name"></el-table-column>-->
        <el-table-column label="服务费类型" prop="goods_fee_type">
          <template slot-scope="scope">
            <div v-if="scope.row.goods_fee_type===1">按订单数</div>
            <div v-else>按成交额</div>
          </template>
        </el-table-column>
        <el-table-column label="商品状态" prop="status">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.status"
              inactive-color="#13ce66"
              active-color="#ff4949"
              inactive-text="推广中"
              active-text="未推广"
            ></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" prop="create_time">
          <template slot-scope="scope">{{scope.row.create_time | dataFormat }}</template>
        </el-table-column>
        <el-table-column label="操作" width="173px">
          <template slot-scope="scope">
            <el-button
              type="success"
              @click="showLookDialog(scope.row)"
              icon="el-icon-view"
              size="mini"
            ></el-button>
            <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeById(scope.row.goods_id)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
      ></el-pagination>
    </el-card>

    <!-- 添加商品的对话框 -->
    <el-dialog title="添加商品" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <!-- 内容主体 -->
      <el-form
        :model="addGoodForm"
        ref="addGoodFormRef"
        :rules="addGoodFormRules"
        label-width="100px"
      >
        <el-form-item label="商品名称" prop="goods_name">
          <el-input v-model="addGoodForm.goods_name"></el-input>
        </el-form-item>
        <el-form-item label="商家名称" prop="name">
          <el-select v-model="addGoodForm.vendor_id" placeholder="请选择商家名称">
            <el-option v-for="item in shoplist" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="商品链接" prop="goods_url">
          <el-input v-model="addGoodForm.goods_url"></el-input>
        </el-form-item>
        <el-form-item label="商品SKU" prop="goods_sku">
          <el-input v-model="addGoodForm.goods_sku"></el-input>
        </el-form-item>
        <el-form-item label="商品前台价" prop="goods_price_raw">
          <el-input v-model="addGoodForm.goods_price_raw"></el-input>
        </el-form-item>
        <el-form-item label="商品券后价" prop="goods_price_disaccount">
          <el-input v-model="addGoodForm.goods_price_disaccount"></el-input>
        </el-form-item>
        <el-form-item label="商品佣金" prop="goods_commission">
          <el-input v-model="addGoodForm.goods_commission"></el-input>
        </el-form-item>
        <el-form-item label="商品服务类型" label-width="107px" prop="goods_fee_type">
          <el-select v-model="addGoodForm.goods_fee_type" placeholder="请选择服务类型">
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="商品服务费" prop="goods_fee">
          <el-input style="width: 50%;" v-model="addGoodForm.goods_fee"></el-input>
          <template>
            <i v-if="addGoodForm.goods_fee_type===2">%</i>
            <i v-else>元/单</i>
          </template>
        </el-form-item>
        <el-form-item label="商品推广文案" label-width="107px" prop="goods_description">
          <el-input v-model="addGoodForm.goods_description"></el-input>
        </el-form-item>
        <el-form-item label="商品图片" prop="goods_image">
          <el-upload
            class="upload-demo"
            action="uploadURL"
            :on-preview="handlePreview"
            :on-remove="handleRemove"
            :file-list="fileList"
            list-type="picture"
          >
            <el-button size="small" type="primary">点击上传</el-button>
            <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
          </el-upload>
        </el-form-item>
        <!-- <el-form-item label="推广状态" prop="status">
          <el-input v-model="addGoodForm.status"></el-input>
        </el-form-item>-->
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 查看商品信息 -->
    <el-dialog title="查看商品" :visible.sync="lookDialogVisible" width="50%" @close="lookDialogClosed">
      <!-- 内容主体 -->
      <el-form :model="lookGoodForm" ref="lookGoodFormRef" label-width="100px">
        <el-form-item label="商品名称" prop="goods_name">
          <el-input disabled v-model="lookGoodForm.goods_name"></el-input>
        </el-form-item>
        <el-form-item label="商家名称" prop="name">
          <el-select disabled v-model="lookGoodForm.vendor_id" placeholder="请选择商家名称">
            <el-option v-for="item in shoplist" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="商品链接" prop="goods_url">
          <el-input disabled v-model="lookGoodForm.goods_url"></el-input>
        </el-form-item>
        <el-form-item label="商品SKU" prop="goods_sku">
          <el-input disabled v-model="lookGoodForm.goods_sku"></el-input>
        </el-form-item>
        <el-form-item label="商品前台价" prop="goods_price_raw">
          <el-input disabled v-model="lookGoodForm.goods_price_raw"></el-input>
        </el-form-item>
        <el-form-item label="商品券后价" prop="goods_price_disaccount">
          <el-input disabled v-model="lookGoodForm.goods_price_disaccount"></el-input>
        </el-form-item>
        <el-form-item label="商品佣金" prop="goods_commission">
          <el-input disabled v-model="lookGoodForm.goods_commission"></el-input>
        </el-form-item>
        <el-form-item label="商品服务类型" label-width="107px" prop="goods_fee_type">
          <el-select disabled v-model="lookGoodForm.goods_fee_type" placeholder="请选择服务类型">
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="商品服务费" prop="goods_fee">
          <el-input disabled style="width: 50%;" v-model="lookGoodForm.goods_fee"></el-input>
          <template>
            <i v-if="lookGoodForm.goods_fee_type===2">%</i>
            <i v-else>元/单</i>
          </template>
        </el-form-item>
        <el-form-item label="商品推广文案" label-width="107px" prop="goods_description">
          <el-input disabled v-model="lookGoodForm.goods_description"></el-input>
        </el-form-item>
        <el-form-item label="商品图片" prop="goods_image">
          <div class="demo-image__preview">
            <el-image style="width: 100px; height: 100px" :src="lookGoodForm.goods_image" :preview-src-list="srcList"></el-image>
          </div>
        </el-form-item>
        <!-- <el-form-item label="推广状态" prop="status">
          <el-input v-model="lookGoodForm.status"></el-input>
        </el-form-item>-->
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="lookDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    // 自定义商家名规则
    var checkName = (rule, value, callback) => {
      this.checkGoodName(value, callback);
    };
    // 自定义sku规则
    var checkSku = (rule, value, callback) => {
      this.checkSku(value, callback);
    };
    return {
      fileList: [
        {
          url:
            "https://fuss10.elemecdn.com/3/63/4e7f3a15429bfda99bce42a18cdd1jpeg.jpeg?imageMogr2/thumbnail/360x360/format/webp/quality/100",
        },
        {
          url:
            "https://fuss10.elemecdn.com/3/63/4e7f3a15429bfda99bce42a18cdd1jpeg.jpeg?imageMogr2/thumbnail/360x360/format/webp/quality/100",
        },
      ],
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 10,
      },
      // 商家列表
      shoplist: [],
      // 商品列表
      goodsList: [
        {
          id: 1,
          vendor_id: "罗技",
          goods_image:
            "https://fuss10.elemecdn.com/3/63/4e7f3a15429bfda99bce42a18cdd1jpeg.jpeg?imageMogr2/thumbnail/360x360/format/webp/quality/100",
          goods_name: "罗技G502鼠标",
          goods_url: "https://item.jd.com/100001691967.html",
          goods_SKU: "1",
          goods_price_raw: "399",
          goods_price_disaccount: "299",
          goods_fee_type: 1,
          status: true,
          reg_time: "2017-11-09T20:36:26.000Z",
        },
        {
          id: 2,
          vendor_id: "罗技",
          goods_name: "罗技G502鼠标",
          goods_url: "https://item.jd.com/100001691967.html",
          goods_SKU: "1",
          goods_price_raw: "399",
          goods_price_disaccount: "299",
          goods_fee_type: 2,
          status: false,
          reg_time: "2017-11-09T20:36:26.000Z",
        },
      ],
      // 商品总数
      total: 1,
      // 商品服务类型
      options: [
        {
          value: 1,
          label: "按订单数",
        },
        {
          value: 2,
          label: "按成交额",
        },
      ],
      // 添加用户对话框
      addDialogVisible: false,
      // 用户添加
      addGoodForm: {
        id: "",
        goods_name: "",
        vendor_id: "",
        goods_url: "",
        goods_sku: "",
        goods_price_raw: "",
        goods_price_disaccount: "",
        goods_commission: "",
        goods_fee_type: 1,
        goods_fee: "",
        pics: [],
        goods_description: "",
        status: "",
      },
      // 图片上传地址
      uploadURL: "http://192.168.0.117/api/common/upload",
      // 用户添加表单验证规则
      addGoodFormRules: {
        goods_name: [
          { required: true, message: "请输入商品名称", trigger: "blur" },
          { validator: checkName, trigger: "blur" },
        ],
        goods_url: [
          { required: true, message: "请输入商品链接", trigger: "blur" },
        ],
        goods_sku: [
          { required: true, message: "请输入商品sku", trigger: "blur" },
          { validator: checkSku, trigger: "blur" },
        ],
        goods_price_raw: [
          { required: true, message: "请输入商品前台价", trigger: "blur" },
        ],
        goods_price_disaccount: [
          { required: true, message: "请选择商品后台价", trigger: "blur" },
        ],
        goods_commission: [
          { required: true, message: "请选择商品佣金", trigger: "blur" },
        ],
      },
      // 查看用户对话框
      lookDialogVisible: false,
      lookGoodForm: {},
    };
  },
  created() {
    this.getGoodsList();
    this.getShopList();
  },
  methods: {
    handleRemove(file, fileList) {
      console.log(file, fileList);
    },
    handlePreview(file) {
      console.log(file);
    },

    // 获取商品列表
    async getGoodsList() {
      const { data: res } = await this.$http.get("api/goods/list", {
        params: this.queryInfo,
      });
      // console.log(res);
      if (res.code !== 1) {
        return this.$message.error("获取商品列表失败！");
      }
      this.goodsList = res.data.data;
    },

    // 获取商家列表
    async getShopList() {
      const { data: res } = await this.$http.post("api/shop/shoplist");
      // console.log(res);
      this.shoplist = res.data;
    },
    // 展示查框
    showLookDialog(row) {
      this.lookGoodForm = row;
      this.lookDialogVisible = true;
    },
    // 关闭查看商品提示框
    lookDialogClosed() {
      this.$refs.lookGoodFormRef.resetFields();
    },
    addGoods() {},
    removeById() {},
    handleSizeChange() {},
    handleCurrentChange() {},
    addDialogClosed() {},
    addUser() {},
    // 异步校验商家名
    async checkGoodName(name, callback) {
      // console.log(this.addGoodForm);
      const { data: res } = await this.$http.post("/api/goods/checkName", {
        goods_name: this.addGoodForm.goods_name,
      });
      if (res.code !== 1) return callback(new Error("商品名称不能重复"));
      callback();
    },
    // 异步校验sku
    async checkSku(name, callback) {
      // console.log(this.addGoodForm);
      const { data: res } = await this.$http.post("/api/goods/checkName", {
        goods_sku: this.addGoodForm.goods_sku,
      });
      if (res.code !== 1) return callback(new Error("商品sku不可用"));
      callback();
    },
  },
};
</script>

<style lang="scss" scoped>
</style>