import React,{useState,Component} from 'react';
import PagingComp from './PagingComponent';
import Modal from './Modal';
import style from './css/accordion.css';
import { timingSafeEqual } from 'crypto';

export default class PhoneBook extends Component{
    constructor(props){
        super(props)
        this.userObjConstructor = function(name,first_email,first_phone,dob){
            this.name = name;
            this.first_email = first_email;
            this.first_phone =first_phone;
            this.dob = dob
        }
        this.state = {
            usersList:[],
            error_message: null,
            pagingBtns:[],
            currentPageId: 1,
            maxPageId:null,
            currentUsersList:[],
            userCount:null,
            userObj:new this.userObjConstructor(null,null,null,null),
            headingTxt:"",
            btnTxt:"",
            otherPhoneCount:0,
            otherPhones:{},
            otherEmailCount:0,
            otherEmails:{},
            searchValue:"",
            isFetching:false
        }
        
        this.setCurrentPageId = this.setCurrentPageId.bind(this)
        this.getUsersListByPageId = this.getUsersListByPageId.bind(this)
        this.userObjConstructor = this.userObjConstructor.bind(this)
        this.inputChangeHandler = this.inputChangeHandler.bind(this)
        this.createNewUser = this.createNewUser.bind(this)
        this.updateUserState = this.updateUserState.bind(this)
        this.resetUser = this.resetUser.bind(this)
        this.editBtnHandler=this.editBtnHandler.bind(this)
        this.saveBtnHandler = this.saveBtnHandler.bind(this)
        this.addPhone = this.addPhone.bind(this)
        this.setOtherPhone = this.setOtherPhone.bind(this)
        this.addEmail = this.addEmail.bind(this)
        this.setOtherEmail = this.setOtherEmail.bind(this)
        this.searchByValue = this.searchByValue.bind(this)
        this.callAPI = this.callAPI.bind(this)
        this.removeBtnHandler = this.removeBtnHandler.bind(this)
    }
    searchByValue(e){
        let {value} = e.target
        this.setState({
            searchValue: value
        },()=>{
            if(value.length >=3 || value.length == 0 ){
                const callback = (response)=>{
                    this.setState({usersList:response.data,userCount:response.data.length,isFetching:false},()=>{
                        this.updateUserState()
                    })
                }
                this.callAPI("/api/user/get-user","POST",{filterBy:"none",key:this.state.searchValue},callback)
            }
            
        })

    }

    callAPI(API_URL,method,payload,callback){
        this.setState({isFetching:true});
        fetch(API_URL,{method,
            headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
            }, body: JSON.stringify(payload)}).
            then(res=>res.json()).
            then(response=>{
                if(response.success){
                    if(callback)
                    callback(response)
                }else{
                    this.setState({error_message:"Something went wrong",isFetching:false})
                }
            }).catch(err=>{
                this.setState({error_message:"Something went wrong"})
            })
    }
    componentDidMount(){
        let usersList = [], error_message = null;
        this.setState({isFetching:true})
        fetch('/api/user/all',{method:"GET"}).then(res=>res.json()).
        then(res=>{
            if(res.success){
                usersList = res.data
                let userCount = usersList.length
                this.setState({usersList,userCount,isFetching:false},()=>{
                    this.updateUserState();
                })
            }else{
                error_message = "Something went wrong!"
                this.setState({error_message,isFetching:false})
            }
        })
        .catch(err=>{
            console.log(err)
            error_message = "Something went wrong!"
            this.setState({error_message,isFetching:false})
        })
    }
    /**
     * On initialization or after adding a user this function will update user state
     */
    updateUserState(){
        let pagingBtns=[],userCount=this.state.userCount
        let fullPages = parseInt(userCount/4) 
        let pageCount = userCount <=4 ? 1 :fullPages + parseInt((userCount-fullPages*4)%4 == 0 ? 0 : 1);
        //Paging Button Constructor
        let pagingBtnObjConstrutor = function(i){
            this.text = i;
            this.id = i;
            this.style = {
                // height:"20px",
                // width:"20px"
            }
        }
        for(let i=1;i<=pageCount;i++){
            let pageBtnObj = new pagingBtnObjConstrutor(i)
            pagingBtns.push(pageBtnObj)
        }
        let currentUsersList = this.getUsersListByPageId(this.state.currentPageId)
        this.setState({pagingBtns,maxPageId:pageCount,currentUsersList:(currentUsersList || this.state.currentUsersList)})
    }
    getUsersListByPageId(pageId){
        if(pageId >= 1){
            let i = (pageId-1)*4,startId = (pageId-1)*4;
            let newUsersList = []
            while(i-startId < 4 && i < this.state.userCount){
                newUsersList.push(this.state.usersList[i])
                i+=1
            }
            return newUsersList
        }
        return null
    }
    setCurrentPageId(pageId){
        if(this.state.currentPageId != pageId){
            this.setState({currentPageId:parseInt(pageId)},()=>{
                //Updating usersList
                let newUsersList = this.getUsersListByPageId(pageId)
                if(newUsersList){
                    this.setState({currentUsersList:newUsersList})
                }
            })
        }
    }
    inputChangeHandler(e){
        let {name,value} = e.target;
        this.setState({
            userObj:{
                ...this.state.userObj,
                [name]:name == "first_phone" ? value.split(" ")[1]:value
            }
        })
    }
    createNewUser(){
        this.setState({isFetching:true})
        fetch("/api/user/create-user",{method:"POST",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }, body: JSON.stringify(this.state.userObj)}
        )
        .then(res=>res.json())
        .then(response=>{
            if(response.success){
                let updateUsersList = this.state.usersList || []
                updateUsersList.push(response.data)
                this.setState(state=>({info_message:"Contact successfully added",userCount:state.userCount+1,usersList:updateUsersList,isFetching:false}))
            }else{
                this.setState({
                    error_message:"Something went wrong!",isFetching:false
                }) 
            }
        }).catch(err=>{
            this.setState({
                error_message:"Something went wrong!",isFetching:false
            })
        })
    }

    /**
     * Function to reset user object to null when we want to create a new user
     */
    resetUser(){
        this.setState({
            userObj: new this.userObjConstructor(null,null,null,null),
            headingTxt:"Add new contact",
            btnTxt:"Add"
        })
    }
    /**
     * Function to edit user
     */
    editBtnHandler(e){
        let {id} = e.target.dataset
        let user = this.state.currentUsersList.find(obj => obj.first_phone == id);
        let otherEmails = this.state.otherEmails,otherPhones=this.state.otherPhones
        let otherEmailCount=this.state.otherEmailCount
        let otherPhoneCount=this.state.otherPhoneCount
        if(user.other_emails){
            let user_email_arr = user.other_emails.split(",");
            otherEmailCount = user_email_arr.length
            user_email_arr.map((email,index)=>{
                let key = `other_email_${index+1}`
                otherEmails[key]=email
            })

        }
        if(user.other_phones){
            let user_phone_arr = user.other_phones.split(",");
            otherPhoneCount = user_phone_arr.length
             user_phone_arr.map((phone,index)=>{
                let key = `other_phone_${index+1}`
                otherPhones[key]=phone
            })

        }
        this.setState({userObj:user,headingTxt:"Edit contact",btnTxt:"Save",otherEmails,otherPhones,otherEmailCount,otherPhoneCount},()=>{
            $("#myModal").modal()
        })
    }

    /**
     * Save Button Handler
     */
    saveBtnHandler(){
        let other_phones = (this.state.otherPhoneCount > 0 && Object.keys(this.state.otherPhones).map(key=> this.state.otherPhones[key])) || []
        let other_emails = (this.state.otherEmailCount > 0 && Object.keys(this.state.otherEmails).map(key=> this.state.otherEmails[key])) || []

        fetch("/api/user/update-user",
        {
            method:'post',
            headers:{
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body:JSON.stringify({
                ...this.state.userObj,
                other_phones:(other_phones || []),
                other_emails:other_emails || []
            })}).
            then(res=>res.json()).
            then(response=>{
                let updatedUser = response.data
                let i = -1;
                this.state.currentUsersList.find((user,index) => {if(user.first_phone == this.state.userObj.first_phone){i=index}})
                let newUsersList = JSON.parse(JSON.stringify(this.state.currentUsersList))
                if(i>=0){
                    newUsersList[i] = updatedUser
                }
                if(response.success){
                    this.setState({info_message:"Contact updated successfully",
                    currentUsersList:newUsersList
                })
                }else{
                    this.setState({error_message:"Something went wrong"})
                }
            }).
            catch(err=>{
                this.setState({error_message:"Something went wrong"})
            })
    }

    /**
     * Add phone in edit or create contact form
     */
    addPhone(e){
        let {actionid} = e.target.dataset
        let index = actionid == "plus" ? this.state.otherPhoneCount+1:this.state.otherPhoneCount
        let key ='other_phone_'+ index
        let updateVal = actionid == "plus"?(this.state.otherPhoneCount+1):(this.state.otherPhoneCount-1)
        console.log("addPhone:::actionid",actionid,e.target)
        this.setState({
            otherPhoneCount: updateVal,
            otherPhones:{
                ...this.state.otherPhones,
                [key]:''
            }
        })
    }
    setOtherPhone(e){
        let {value} = e.target;
        let {key} = e.target.dataset
        this.setState({
            otherPhones:{
                ...this.state.otherPhones,
                [key]:value.split(" ")[1]
            }
        })

    }

    addEmail(e){
        let {actionid} = e.target.dataset
        let index = actionid == "plus" ? this.state.otherEmailCount+1:this.state.otherEmailCount
        let key ='other_email_'+ index
        let updateVal = actionid == "plus"?(this.state.otherEmailCount+1):(this.state.otherEmailCount-1)
        this.setState({
            otherEmailCount: updateVal,
            otherEmails:{
                ...this.state.otherEmails,
                [key]:''
            }
        })
    }
    setOtherEmail(e){
        let {value} = e.target;
        let {key} = e.target.dataset
        this.setState({
            otherEmails:{
                ...this.state.otherEmails,
                [key]:value
            }
        })

    }
    removeBtnHandler(e){
        let {id} = e.target.dataset
        const callback = (response)=>{
            let newCurrentUsersList = this.state.currentUsersList,newTotalUsersList = this.state.usersList
            newCurrentUsersList = newCurrentUsersList.filter(user => user.first_phone != id)
            newTotalUsersList = newTotalUsersList.filter(user => user.first_phone != id)
            this.setState({currentUsersList:newCurrentUsersList,isFetching:false,usersList:newTotalUsersList})
        }
        this.callAPI("/api/user/delete-user","POST",{first_phone:id},callback)

    }
    render(){
        return(
        <>
            {
                this.state.info_message && 
                <div className="container">
                    <p style={{color:"green"}}>
                        <span className="glyphicon glyphicon-ok"></span>
                        &nbsp;
                        {this.state.info_message}
                    </p>
                </div>
            }
            {
                this.state.error_message && 
                <div className="container">
                    <p style={{color:"red"}}>
                        <span className="glyphicon glyphicon-remove"></span>
                        &nbsp;
                        {this.state.error_message}
                    </p>
                </div>
            }
            {
                <div className="container">
                    <div className="form-group">
                        <input type="text" placeholder="Search by name,primary contact or primary email" value={this.state.searchValue} onChange={this.searchByValue} className="form-control"/>
                    </div>
                </div>
            }
            {
                this.state.isFetching && <div className={`container ${style.loader}`}></div>
            }
            {
                this.state.usersList.length > 0 &&
                <>
                    <UserList 
                        usersList={this.state.currentUsersList} 
                        pagingBtns={this.state.pagingBtns} 
                        maxPageId={this.state.maxPageId} 
                        currentPageId={this.state.currentPageId} 
                        setCurrentPageId={this.setCurrentPageId} 
                        userObj={this.state.userObj}
                        inputChangeHandler={this.inputChangeHandler}
                        createNewUser = {this.createNewUser}
                        resetUser = {this.resetUser}
                        editBtnHandler={this.editBtnHandler}
                        headingTxt={this.state.headingTxt}
                        btnTxt={this.state.btnTxt}
                        saveBtnHandler={this.saveBtnHandler}
                        addPhone={this.addPhone}
                        setOtherPhone={this.setOtherPhone}
                        otherPhoneCount={this.state.otherPhoneCount}
                        otherPhones={this.state.otherPhones}
                        removeBtnHandler={this.removeBtnHandler}
                        addEmail={this.addEmail}
                        setOtherEmail={this.setOtherEmail}
                        otherEmailCount={this.state.otherEmailCount}
                        otherEmails={this.state.otherEmails}
                    />
                </>
            }
        </>
        )
    }
}

export const UserList = (props) => {
    let modalProps={
        ...props.userObj,
        inputChangeHandler:props.inputChangeHandler,
        headingTxt:props.headingTxt,
        btnTxt:props.btnTxt,
        createNewUser:props.createNewUser,
        saveBtnHandler:props.saveBtnHandler,
        addPhone:props.addPhone,
        setOtherPhone:props.setOtherPhone,
        otherPhoneCount:props.otherPhoneCount,
        otherPhones:props.otherPhones,
        addEmail:props.addEmail,
        setOtherEmail:props.setOtherEmail,
        otherEmailCount:props.otherEmailCount,
        otherEmails:props.otherEmails

    }
    return(
    <>
        <div>
            {
                props.usersList.map((user,index)=>{
                    return (<Accordion key={index} user={user} editBtnHandler={props.editBtnHandler} removeBtnHandler={props.removeBtnHandler}/>)
                })
            }
            <PagingComp currentPageId={props.currentPageId} pagingBtns={props.pagingBtns} maxPageId={props.maxPageId} setCurrentPageId={props.setCurrentPageId}/>
        </div>
        <button type="button" style={{borderRadius:"50%",backgroundColor:"black",marginLeft:"95%"}} onClick={props.resetUser} className="btn btn-info btn-lg" data-toggle="modal" data-target="#myModal"><span className="glyphicon glyphicon-plus"></span></button>
        <Modal {...modalProps}/>
    </> 

    )
}

const Accordion = (props)=>{
    const [active,setActive] = useState(false);
    const toogle = (e)=>{        
        setActive(!active)
        let panel = e.target.nextElementSibling;
        if (panel.style.maxHeight) {
            panel.style.maxHeight = null;
        } else {
            panel.style.maxHeight = panel.scrollHeight + "px";
        } 
    }
    return(
        <>
            <div className="container">
                <button className={active ? `${style.accordion} ${style.active}`:`${style.accordion}`} onClick={toogle} >{props.user.name}</button>
                <div className={`${style.panel}`}>
                    <h5><b>{props.user.name}</b></h5>
                    <div className={"container"}>
                        <div className="row">
                            <div className="col-md-6">
                                <span>{props.user.dob.split("T")[0].split("-").reverse().join("/")}</span>
                            </div>
                            <div className="col-md-6">
                                <div className={style.editRemoveBtnGrp}>
                                    <button type="button" data-id={props.user.first_phone} className={`${style.editBtn} btn`} onClick={props.editBtnHandler}>Edit</button>
                                    <button type="button" data-id={props.user.first_phone} className={`${style.removeBtn} btn`} onClick={props.removeBtnHandler} >Remove</button>
                                </div>
                            </div>
                        </div>
                        <div className="clearfix"></div>
                        <div className={`${style.userItems}`}>
                            <div className={"row"}>
                                <div className={"col-md-6"}>
                                    <div className="row" style={{margin:"1%"}}>
                                        <span className="glyphicon glyphicon-earphone"></span>
                                        &nbsp;
                                        <span>+91 {props.user.first_phone}</span>
                                    </div>

                                    {
                                        props.user.other_phones && props.user.other_phones.split(",").map((phone,index)=>{
                                        return(
                                            <div className="row" key={index} style={{margin:"1%"}}>
                                                <span className="glyphicon glyphicon-earphone"></span>
                                                &nbsp;
                                                <span>+91 {phone}</span>
                                            </div>
                                        )
                                        })
                                    }
                                </div>
                                <div className={"col-md-6"}>
                                    <div className="row" style={{margin:"1%"}}>
                                        <span className="glyphicon glyphicon-envelope"></span>
                                        &nbsp;
                                        <span className={style.rowItem}>{props.user.first_email}</span>
                                    </div>

                                    {
                                        props.user.other_emails && props.user.other_emails.split(",").map((email,index)=>{
                                        return(
                                            <div className="row" key={index} style={{margin:"1%"}}>
                                                <span className="glyphicon glyphicon-envelope"></span>
                                                &nbsp;
                                                <span>{email}</span>
                                            </div>
                                        )
                                        })
                                    }
                                </div>
                            </div>
                            
                        </div>
                        
                    </div>   
                </div>
            </div>    
        </> 

    )
}