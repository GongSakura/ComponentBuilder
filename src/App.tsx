
import React, { ReactNode,Component, ChangeEvent } from 'react'
import {InteractElement,InteractItemProps} from './components/interactElement'
import './App.less'

interface AppState{
  interactElements:Array<ReactNode>
  stageScale:number
  stageWidth:number
  stageHeight:number
  stagePosition:{
    x:number
    y:number
  }
  }
type AppProp = Record<string,never>

class App extends Component<AppProp,AppState>{
  interactElementNumber=0
  interactBoard!:HTMLElement
  interactStage!:HTMLElement
  scaleSmallStep=0.025
  scaleLargeStep=0.1
  scaleUpperBound=3
  scaleLowerBound=0.5
  mouseInBoard=false
  grabInBoard=false
  moveInBoard=false
  mousePosition={
    x:0,
    y:0,
  }

  constructor(props:AppProp){
    super(props)
    this.state={
      interactElements:[],
      stageScale:1,
      stageWidth:100,
      stageHeight:100,
      stagePosition:{
        x:0,
        y:0
      }
    }
    this.addInteractElement=this.addInteractElement.bind(this)
    this.handleScaleStageEvent=this.handleScaleStageEvent.bind(this)
    this.handleResizeStageEvent=this.handleResizeStageEvent.bind(this)
    this.handleKeyDownEvent=this.handleKeyDownEvent.bind(this)
    this.handleKeyUpEvent=this.handleKeyUpEvent.bind(this)
    this.handleMouseEvent=this.handleMouseEvent.bind(this)
  }

  addInteractElement(event: React.MouseEvent):void{
    event.preventDefault()
    const interactProps:InteractItemProps={
      draggable:true,
      dropzone:false,
      resizable:true,
      stageScale:this.state.stageScale
      }
      const updateInteractElements:Array<ReactNode> = [...this.state.interactElements]
      updateInteractElements.push(<InteractElement key={this.interactElementNumber} {...interactProps}><div>test-dom</div></InteractElement>)
      this.setState({
        interactElements:updateInteractElements
      })   
      this.interactElementNumber++
  }
  handleSelectItemEvent(event:MouseEvent){
  
    document.querySelectorAll('.interact-item.selected').forEach(e=>e.classList.remove('selected'))
    const target:HTMLElement= event.target as HTMLElement
    if(target.classList.contains('interact-item')){
      target.classList.add('selected')
    }
  }
  handleScaleStageEvent(event:WheelEvent){
    console.log(event)
    console.log()
    if(event.metaKey){
      event.preventDefault()
      const oldScaleRatio = this.state.stageScale
      let newScaleRatio = oldScaleRatio
      if(event.deltaY>0 && oldScaleRatio>this.scaleLowerBound){
          // scale down
          oldScaleRatio<1?newScaleRatio-=this.scaleSmallStep:newScaleRatio-=this.scaleLargeStep
      }else if(event.deltaY<0 && oldScaleRatio<this.scaleUpperBound){
        oldScaleRatio<1?newScaleRatio+=this.scaleSmallStep:newScaleRatio+=this.scaleLargeStep
      }
      if(newScaleRatio!==oldScaleRatio){
        this.setState({
          stageScale:newScaleRatio
        })

          const rect = this.interactBoard.getBoundingClientRect()
          const pointer={
            x:event.clientX-rect.x,
            y:event.clientY-rect.y
          }
          const mousePointTo={
            x:(pointer.x-this.state.stagePosition.x)/oldScaleRatio,
            y:(pointer.y-this.state.stagePosition.y)/oldScaleRatio
        }

        this.setState({
          stagePosition:{
            x:pointer.x-mousePointTo.x*newScaleRatio,
            y:pointer.y-mousePointTo.y*newScaleRatio,
          }
        })
      }
      
    }
  }
  handleResizeStageEvent(event:ChangeEvent){
    const target = event.currentTarget as HTMLInputElement
    if(target.classList.contains('page-width')){
      const value = parseInt(target.value) || 0
      this.setState({stageWidth:value})
    }else if(target.classList.contains('page-height')){
      const value = parseInt(target.value) || 0
      this.setState({stageHeight:value})
    }
  }
  handleMouseEvent(event:MouseEvent){

    switch (event.type){
      case 'mouseenter':
        this.mouseInBoard=true
        break
      case 'mouseleave':
        this.mouseInBoard=false
        break
      case 'mousemove':
        if(this.grabInBoard && this.moveInBoard){
          const n_x = this.state.stagePosition.x +event.clientX-this.mousePosition.x
          const n_y = this.state.stagePosition.y +event.clientY-this.mousePosition.y
          this.setState({
            stagePosition:{
              x:n_x,
              y:n_y
            }
          })
          this.mousePosition.x=event.clientX
          this.mousePosition.y=event.clientY
      }
        break
      case 'mousedown':
        if(this.grabInBoard){
          this.moveInBoard=true
          this.mousePosition.x=event.clientX
          this.mousePosition.y=event.clientY
        }
        break
      case 'mouseup': 
        this.moveInBoard=false
        break

    }
    
  }
  handleKeyDownEvent(event:KeyboardEvent){
    event.preventDefault()
    if(event.code==='Space' && this.mouseInBoard){
      this.interactBoard.style.cursor='grab'
      this.grabInBoard=true
    }
  }
  handleKeyUpEvent(event:KeyboardEvent){
    event.preventDefault()
    if(event.code==='Space' ){
      this.interactBoard.style.cursor=''
      this.grabInBoard=false
    }
    
  }

  componentDidMount(){
    this.interactBoard=document.querySelector('#interact-board') as HTMLElement
    this.interactStage=document.querySelector('#interact-stage') as HTMLElement

    this.interactBoard?.addEventListener('click',this.handleSelectItemEvent)
    this.interactBoard?.addEventListener('mousemove',this.handleMouseEvent)
    this.interactBoard?.addEventListener('mousedown',this.handleMouseEvent)
    this.interactBoard?.addEventListener('mouseup',this.handleMouseEvent)
    this.interactBoard?.addEventListener('mouseenter',this.handleMouseEvent)
    this.interactBoard?.addEventListener('mouseleave',this.handleMouseEvent)

    document.addEventListener('keydown',this.handleKeyDownEvent)
    document.addEventListener('keyup',this.handleKeyUpEvent)
    this.interactStage?.addEventListener('wheel',this.handleScaleStageEvent)
  }
  componentWillUnmount(){
    this.interactBoard?.removeEventListener('click',this.handleSelectItemEvent)
    this.interactBoard?.removeEventListener('mousemove',this.handleMouseEvent)
    this.interactBoard?.removeEventListener('mousedown',this.handleMouseEvent)
    this.interactBoard?.removeEventListener('mouseup',this.handleMouseEvent)
    this.interactBoard?.removeEventListener('mouseenter',this.handleMouseEvent)
    this.interactBoard?.removeEventListener('mouseleave',this.handleMouseEvent)

    document.removeEventListener('keydown',this.handleKeyDownEvent)
    document.removeEventListener('keyup',this.handleKeyUpEvent)

    this.interactStage?.removeEventListener('wheel',this.handleScaleStageEvent)
  }
  render(): ReactNode {
      return <>
        <div id='interact-toolbar'>
          <button onClick={this.addInteractElement}>Add</button>
          <div id='interact-controller'>
            <span>Width</span>
            <input className='page-width' type="text" value={this.state.stageWidth} onChange={this.handleResizeStageEvent}/>
            <span>Height</span>
            <input className='page-height' type="text"  value={this.state.stageHeight} onChange={this.handleResizeStageEvent}/>
            <span>SclaeRatio: {this.state.stageScale.toFixed(2)}</span>
          </div>
        </div>
        <div id='interact-board'>
          <div id='interact-stage' style={
            {transform:`scale(${this.state.stageScale})`,
            width:this.state.stageWidth+'%',
            height:this.state.stageHeight+'%',
            left:this.state.stagePosition.x+'px',
            top:this.state.stagePosition.y+'px'}}> 
            {this.state.interactElements}
          </div>
        </div>
      </>
  }
}
{/* <div id='interact-stage' style={
            {transform:`scale(${this.state.stageScale}) translateX(${this.state.stagePosition.x}px) translateY(${this.state.stagePosition.y}px)`,
            width:this.state.stageWidth+'%',
            height:this.state.stageHeight+'%'}}>
            {this.state.interactElements}
          </div> */}


export default App
