import React from 'react';
import InputForm from './Form';
const Modal = props => {
    return(
    <>
        <div id="myModal" className="modal fade" role="dialog">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <button type="button" className="close" data-dismiss="modal">&times;</button>
                        <h4 className="modal-title">{props.headingTxt}</h4>
                    </div>
                    <div className="modal-body">
                        <InputForm {...props}/>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-default" data-dismiss="modal">Close</button>
                        <button type="button" className="btn btn-success" data-dismiss="modal" onClick={props.btnTxt == "Add"?props.createNewUser:props.saveBtnHandler}>{props.btnTxt}</button>
                    </div>
                </div>

            </div>
        </div>
    </>
    )
}

export default Modal;