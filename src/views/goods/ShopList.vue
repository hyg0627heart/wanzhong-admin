<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商家列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 商品列表 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="6">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getShopList">
            <el-button slot="append" icon="el-icon-search" @click="getShopList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">注册商家</el-button>
        </el-col>
      </el-row>
      <el-table :data="shoplist" border stripe>
        <!-- stripe: 斑马条纹
        border：边框-->
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="name" label="商家名称"></el-table-column>
        <el-table-column prop="mobile" label="手机号"></el-table-column>
        <el-table-column prop="user.username" label="注册人"></el-table-column>
        <el-table-column prop="status" label="状态">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.status"
              active-color="#13ce66"
              inactive-color="#ff4949"
              @change="shopStateChanged(scope.row)"
            ></el-switch>
          </template>
        </el-table-column>
        <el-table-column prop="reg_time" label="创建时间">
          <template slot-scope="scope">{{scope.row.create_time | dataFormat }}</template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              circle
              @click="showEditDialog(scope.row)"
            ></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              circle
              @click="removeUserById(scope.row.id)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.pagenum"
          :page-sizes="[3, 5, 10, 15]"
          :page-size="queryInfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        ></el-pagination>
    </el-card>

    <!-- 注册商家对话框 -->
    <el-dialog title="注册商家" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <el-form
        ref="addShopFormRef"
        :rules="addShopFormRules"
        :model="addShopForm"
        label-width="100px"
      >
        <el-form-item label="商家名称" prop="name">
          <el-input v-model="addShopForm.name"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="addShopForm.mobile"></el-input>
        </el-form-item>
        <el-form-item label="商家用户名" prop="username">
          <el-input v-model="addShopForm.uername"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addShopForm.password"></el-input>
        </el-form-item>
        <el-form-item label="注册人" prop="uid">
          <el-select v-model="addShopForm.uid" placeholder="请选择注册人">
            <el-option
              v-for="item in userlist"
              :key="item.id"
              :label="item.username"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addShop">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 修改商家对话框 -->
    <el-dialog title="修改商家" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <el-form
        ref="editShopFormRef"
        :rules="editShopFormRules"
        :model="addShopForm"
        label-width="100px"
      >
        <el-form-item label="商家名称" prop="name">
          <el-input v-model="addShopForm.name"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="addShopForm.mobile"></el-input>
        </el-form-item>
        <el-form-item label="商家用户名" prop="username">
          <el-input v-model="addShopForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addShopForm.password"></el-input>
        </el-form-item>
        <el-form-item label="注册人" prop="uid">
          <el-select v-model="addShopForm.uid" placeholder="请选择注册人">
            <el-option
              v-for="item in userlist"
              :key="item.uid"
              :label="item.username"
              :value="item.uid"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editShop">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    // 自定义手机号规则
    var checkMobile = (rule, value, callback) => {
      const regMobile = /^1[34578]\d{9}$/;
      if (!regMobile.test(value)) {
        return callback(new Error("请输入合法的手机号码"));
      } else {
        this.checkMobileno(value, callback);
      }
    };
    // 自定义商家名规则
    var checkName = (rule, value, callback) => {
      this.checkShopName(value, callback);
    };
    return {
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 100,
        sortBy: "id",
        desc: "esc",
      },
      addDialogVisible: false,
      //   商家列表
      shoplist: [],
      total: 0,
      //   注册商家
      addShopForm: {
        uid: "",
        name: "",
        mobile: "",
        username: "",
        password: "",
      },
      //注册人列表
      userlist: [],
      //   注册用户表单验证
      addShopFormRules: {
        name: [
          { required: true, message: "请输入商家名", trigger: "blur" },
          {
            min: 2,
            max: 10,
            message: "商家名的长度在2～10个字",
            trigger: "blur",
          },
          { validator: checkName, trigger: "blur" },
        ],
        mobile: [
          { required: true, message: "请输入手机号码", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" },
        ],
        password: [
          { required: false, message: "请输入用户密码", trigger: "blur" },
          {
            min: 6,
            max: 18,
            message: "用户密码的长度在6～18个字",
            trigger: "blur",
          },
        ],
      },
      //   修改商家
      editDialogVisible: false,
      editShopForm: {
        uid: "",
        username: "",
        password: "",
        name: "",
        mobile: "",
      },
      // 编辑商家表单验证
      editShopFormRules: {
        name: [
          { required: true, message: "请输入商家名", trigger: "blur" },
          {
            min: 2,
            max: 10,
            message: "商家名的长度在2～10个字",
            trigger: "blur",
          },
          { validator: checkName, trigger: "blur" },
        ],
        mobile: [
          { required: true, message: "请输入手机号码", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" },
        ],
      },
      shopInfo: {},
    };
  },
  created() {
    this.getShopList();
    this.getUserList();
  },
  methods: {
    //   获取商家
    async getShopList() {
      const { data: res } = await this.$http.get("/api/shop/list", {
        params: this.queryInfo,
      });
      if (res.code !== 1) {
        return this.$message.error("获取商家列表失败！");
      }
      this.shoplist = res.data.data;
      this.total = res.data.total;
    },
    // 监听 pagesize改变的事件
    handleSizeChange(newSize) {
      // console.log(newSize)
      this.queryInfo.pagesize = newSize;
      this.getShopList();
    },
    // 监听 页码值 改变事件
    handleCurrentChange(newSize) {
      // console.log(newSize)
      this.queryInfo.pagenum = newSize;
      this.getShopList();
    },
    // 获取用户
    async getUserList() {
      const { data: res } = await this.$http.post("/api/user/userlist");
      if (res.code !== 1) {
        return this.$message.error("获取用户列表失败！");
      }
      this.userlist = res.data;
    },
    //   添加商家
    addShop() {
      console.log(this.addShopForm);
      console.log(this.editShopForm);
      this.$refs.addShopFormRef.validate(async (valid) => {
        console.log(valid);
        if (!valid) return;
        const { data: res } = await this.$http.post(
          "/api/shop/add",
          this.addShopForm
        );
        if (res.code !== 1) {
          this.$message.error("添加商家失败！");
        }
        this.$message.success("添加商家成功！");
        this.addDialogVisible = false;
        this.getShopList();
      });
    },
    // 关闭添加商家提示框
    addDialogClosed() {
      this.$refs.addShopFormRef.resetFields();
      this.addShopForm = {};
    },
    // 修改商家对话框
    showEditDialog(row) {
      this.addShopForm = row;
      console.log(this.addShopForm);
      this.editDialogVisible = true;
    },
    // 修改商家
    editShop() {
      console.log(this.editShopForm);
      this.$refs.editShopFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.post(
          "/api/shop/add",
          this.addShopForm
        );
        if (res.code !== 1) {
          this.$message.error("修改商家失败！");
        }
        this.$message.success("修改商家成功！");
        this.editDialogVisible = false;
        // this.addShopForm = this.editShopForm;
        this.getShopList();
      });
    },
    //关闭修改商家提示框
    editDialogClosed() {
      this.$refs.editShopFormRef.resetFields();
      this.addShopForm = {};
    },
    // 删除商家
    async removeUserById(id) {
      console.log(id);
      const confirmResult = await this.$confirm(
        "此操作将删除该商家, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      // 点击确定 返回值为：confirm
      // 点击取消 返回值为： cancel
      if (confirmResult !== "confirm") {
        return this.$message.info("已取消删除");
      }
      const { data: res } = await this.$http.post("/api/shop/del", {
        id: id,
      });
      console.log(res);
      if (res.code !== 1) return this.$message.error("删除商家失败！");
      this.$message.success("删除商家成功！");
      this.getShopList();
    },
    // 监听switch开关 修改状态
    async shopStateChanged(shopInfo) {
      console.log(shopInfo.status);
      const { data: res } = await this.$http.post("/api/shop/checkStatus", {
        id: shopInfo.id,
        status: shopInfo.status,
      });
      if (res.code !== 1) {
        shopInfo.status = !shopInfo.status;
        return this.$message.error("更新商家状态失败！");
      }
      this.$message.success("更新商家状态成功！");
    },
    // 异步校验商家名
    async checkShopName(name, callback) {
      // console.log(this.addShopForm);
      const { data: res } = await this.$http.post(
        "/api/shop/checkName",
        this.addShopForm
      );
      if (res.code !== 1) return callback(new Error("商家名称不能重复"));
      callback();
    },
    // 异步校验手机号
    async checkMobileno(mobile, callback) {
      const { data: res } = await this.$http.post(
        "/api/shop/checkMobile",
        this.addShopForm
      );
      if (res.code !== 1) return callback(new Error("手机号不能重复"));
      callback();
    },
  },
};
</script>

<style lang="scss" scoped>
</style>