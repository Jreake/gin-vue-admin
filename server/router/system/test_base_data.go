package system

import (
	v1 "github.com/flipped-aurora/gin-vue-admin/server/api/v1"
	"github.com/flipped-aurora/gin-vue-admin/server/middleware"
	"github.com/gin-gonic/gin"
)

type TestRouter struct {}

func (s *TestRouter) InitTestRouter(Router *gin.RouterGroup)(R gin.IRoutes){
	testRouter := Router.Group("test").Use(middleware.OperationRecord())
	testApi := v1.ApiGroupApp.SystemApiGroup.TestApi
	{
		testRouter.GET("getTestInfo", testApi.GetTestInfo)    //测试数据
	}
	return testRouter
}
