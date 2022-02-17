
import React, { ReactNode,Component } from 'react'
import {InteractElement,InteractProps} from './components/interactElement'
import './App.less'

interface AppState{
  interactElements:Array<ReactNode>
}
type AppProp = Record<string,never>

class App extends Component<AppProp,AppState>{
  interactElementNumber=0
  constructor(props:AppProp){
    super(props)
    this.state={
      interactElements:[]
    }
    this.addInteractElement=this.addInteractElement.bind(this)
    
  }

  addInteractElement(event: React.MouseEvent):void{
    event.preventDefault()
    const interactProps:InteractProps={
      draggable:true,
      dropzone:false,
      resizable:true,
      }
      const updateInteractElements:Array<ReactNode> = [...this.state.interactElements]
      updateInteractElements.push(<InteractElement  key={this.interactElementNumber} {...interactProps}><div>test-dom</div></InteractElement>)
      this.setState({
        interactElements:updateInteractElements
      })   
      this.interactElementNumber++
  }
  render(): ReactNode {
      return <>
        <div className='interact-toolbar'>
          <button onClick={this.addInteractElement}>Add</button>
        </div>
        <div className='interact-board'>
          <div className='interact-container'>
            {this.state.interactElements}
          </div>
        </div>
      </>
  }
}


export default App
