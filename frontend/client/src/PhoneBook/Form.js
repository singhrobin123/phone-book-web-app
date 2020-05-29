import React from 'react';

const InputForm = props => {

    return(
        <form action="/action_page.php">
            <div className="form-group">
                <label htmlFor="name">Name</label>
                <input type="text" name="name" value={props.name || ""} className="form-control" id="name" onChange={props.inputChangeHandler} />
            </div>
            <div className="form-group">
                <label htmlFor="first_phone">Mobile Number</label>
                <div style={{display:"flex"}}>
                    <input type="tel" className="form-control" name="first_phone" value={`+91 ${props.first_phone || ""}`} disabled={props.btnTxt == "Save"} id="first_phone" onChange={props.inputChangeHandler} />
                    {(props.btnTxt=="Save")&&
                    <button type="button" data-actionid ="plus" onClick={props.addPhone} style={{borderRadius:"50%",marginLeft:"2px"}}><span data-actionid="plus" className="glyphicon glyphicon-plus"></span></button>
                     } </div>
            </div>
            {
                props.otherPhoneCount > 0 &&
                [...Array(props.otherPhoneCount+1).keys()].map((key,index)=>{
                    
                    if(key > 0){
                        let myKey = 'other_phone_'+key
                        let phone = props.otherPhones[myKey]
                        console.error(myKey,phone)
                        return(
                            <div className="form-group" key={index}>
                                <div style={{display:"flex"}}>
                                    <input type="tel" className="form-control" name="other_phone" data-key={`other_phone_${index}`} value={`+91 ${phone || ""}`}  id={`other_phone_${index}`} onChange={props.setOtherPhone} />
                                    <button type="button" data-actionid="minus" onClick={props.addPhone} style={{borderRadius:"50%",marginLeft:"2px"}}><span data-actionid="minus" className="glyphicon glyphicon-minus"></span></button>
                                </div>
                            </div>
                        )
                    }  
                })
            }
            <div className="form-group">
                <label htmlFor="dob">DOB</label>
                <input type="date" className="form-control" name="dob" value={(props.dob && props.dob.split("T")[0]) || ""} id="dob" onChange={props.inputChangeHandler} />
            </div>
            <div className="form-group">
                <label htmlFor="first_email">Email</label>
                <div style={{display:"flex"}}>
                    <input type="email" className="form-control" name="first_email" value={props.first_email || ""} disabled={props.btnTxt == "Save"} id="first_email" onChange={props.inputChangeHandler} />
                    { (props.btnTxt=="Save")&&
                        <button type="button" data-actionid="plus" onClick={props.addEmail} style={{borderRadius:"50%",marginLeft:"2px"}}><span data-actionid="plus" className="glyphicon glyphicon-plus"></span></button>
                    }
                        </div>
                {
                props.otherEmailCount > 0 &&
                [...Array(props.otherEmailCount+1).keys()].map((key,index)=>{
                    
                    if(key > 0){
                        let myKey = `other_email_${key}`
                        let email = props.otherEmails[myKey]
                        return(
                            <div className="form-group" key={index}>
                                <div style={{display:"flex"}}>
                                    <input type="tel" className="form-control" name="other_phone" data-key={`other_email_${index}`} value={`${email || ""}`}  id={`other_email_${index}`} onChange={props.setOtherEmail} />
                                    <button type="button" data-actionid="minus" onClick={props.addEmail} style={{borderRadius:"50%",marginLeft:"2px"}}><span data-actionid="minus" className="glyphicon glyphicon-minus"></span></button>
                                </div>
                            </div>
                        )
                    }  
                })
            }
            </div>
        </form>
    )
}

export default InputForm;