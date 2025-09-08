class apiresponse{
    constructor(statuscode,data,token,message="success"){
this.statuscode=statuscode
this.data=data
this.token=token
this.message=message
    }
}

export {apiresponse}