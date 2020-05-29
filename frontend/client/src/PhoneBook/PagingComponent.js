import React from 'react';
import style from './css/paging.css';
const PagingComp = props =>{
    const backButtonHandler = ()=>{
        if(props.currentPageId > 1){
            props.setCurrentPageId(parseInt(props.currentPageId)-1)
        }
    }
    const forwardButtonHandler = ()=>{
        if(props.currentPageId < props.maxPageId){
            props.setCurrentPageId(parseInt(props.currentPageId)+1)
        }
    }
    const pagingBtnHandler = (e)=>{
        let {pageid} = e.target.dataset
        props.setCurrentPageId(pageid)
    }
    return(
        <div className="container">
            <div style={{textAlign:"center",padding:"0px 5px"}}>
                <button type="button" onClick={backButtonHandler}>{"<<"}</button>
                {
                    props.pagingBtns.map((btn,index)=>{
                        return (
                            <button className={(props.currentPageId == btn.id) ?`${style.active}`:""} type="button" key={index} style={btn.style} data-pageid={btn.id} onClick={pagingBtnHandler}>{btn.text}</button>
                        )
                    })
                }
                <button type="button" onClick={forwardButtonHandler}>{">>"}</button>
            </div>
        </div>
    )
}

export default PagingComp;