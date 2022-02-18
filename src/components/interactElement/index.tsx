import './index.less'
import React, { cloneElement, ReactElement } from 'react'
import interact from 'interactjs'
import type { DraggableOptions, DropzoneOptions, ResizableOptions, Interactable, DragEvent, ResizeEvent,PointerEventType } from '@interactjs/types/index'
import modifiers from '@interactjs/modifiers/plugin'

export interface InteractItemProps {
    draggable: boolean
    draggableOptions?: DraggableOptions
    dropzone: boolean
    dropzoneOptions?: DropzoneOptions
    resizable: boolean
    resizableOptions?: ResizableOptions
    stageScale:number
}
interface InteractItemState{
    itemPosition:{
        x:number
        y:number
    },
    itemSize:{
        width:number
        height:number
    }
}



export class InteractElement extends React.Component<InteractItemProps,InteractItemState>{
    node?: HTMLElement
    interact?: Interactable
    draggableOptions: DraggableOptions
    resizableOptions: ResizableOptions
    tempItemPosition:{
        x:number
        y:number
     }
     tempItemSize?:{
         width:number
         height:number
     }
    mousePosition={
        x:0,
        y:0
    }

    constructor(props: InteractItemProps) {
        super(props)
        this.state={
            itemPosition:{
                x:0,
                y:0
            },
            itemSize:{
                width:50,
                height:100,
            }
        }
        this.tempItemPosition={
            x:this.state.itemPosition.x,
            y:this.state.itemPosition.y
        }
  
        this.draggableOptions = {
            onstart:(event: DragEvent)=>{
                this.mousePosition.x=event.clientX
                this.mousePosition.y=event.clientY
                const target:HTMLElement = event.target as HTMLElement
                if(!target.classList.contains('dragging')){
                    target.classList.add('dragging')
                }
            },
            onmove: (event: DragEvent) => {
                console.log(event)
                
                const n_x = this.tempItemPosition.x + event.clientX-this.mousePosition.x
                const n_y = this.tempItemPosition.y + event.clientY-this.mousePosition.y
                
                // update
                this.tempItemPosition.x=n_x
                this.tempItemPosition.y=n_y

                const target = event.target as HTMLElement
                Object.assign(target.style,{
                    top:n_y,
                    left:n_x
                })

                // execute hook
                if (typeof props.draggableOptions?.onmove === 'function') {
                    props.draggableOptions.onmove(event)
                }
            },

            onend: (event: DragEvent) => {
                this.setState({
                    itemPosition:{
                        x:this.tempItemPosition.x,
                        y:this.tempItemPosition.y
                    }
                })
                const target = event.target as HTMLElement
                target.classList.remove('dragging')
                if(!target.classList.contains('selected')){
                    target.classList.add('selected')
                }

            },
            modifiers:[interact.modifiers.restrictRect({
                restriction:'parent',
                endOnly:true
            })]
        }
        this.resizableOptions = {
            margin: 4,
            edges: Object.assign({ bottom: true, right: true, top: true, left: true }, props.resizableOptions?.edges),
            invert: props.resizableOptions?.invert || 'reposition',
            onstart:(event:ResizeEvent)=>{
                const target = event.target as HTMLElement
                if(!target.classList.contains('selected')){
                    target.classList.add('selected')
                }
            },
            onmove: (event: ResizeEvent) => {
                
                if (typeof props.resizableOptions?.onmove === 'function') {
                    props.resizableOptions.onmove(event)
                }
                // update
                const updateItemPosition={
                    x:this.state.itemPosition.x,
                    y:this.state.itemPosition.y
                }
                if(event.edges?.left){
                    updateItemPosition.x+=event.delta.x
                }
                if(event.edges?.top){
                    updateItemPosition.y+=event.delta.y
                }

                const updateItemSize={
                    width:event.rect.width,
                    height:event.rect.height
                }

                // this.setState({
                //     itemPosition:updateItemPosition,
                //     itemSize:updateItemSize
                // })
               
            },
            modifiers:[interact.modifiers.restrictSize({
                min:{width:4,height:4}
            })]

        }
    }

    setInteractions() {
        if (this.props.draggable) {
            this.interact?.draggable(this.draggableOptions)
        }
        if (this.props.resizable){
            this.interact?.resizable(this.resizableOptions)
        }
          
        this.interact?.on('tap',(event:PointerEvent)=>{
            const target = event.target as HTMLElement
            if(!target.classList.contains('selected')){
                target.classList.add('selected')
            }
          
        })
    }

    componentDidMount() {
        this.interact = interact(this.node as HTMLElement)
        this.setInteractions()
    }

    componentDidUpdate() {
        this.interact = interact(this.node as HTMLElement)
        this.setInteractions()
    }

    render(): React.ReactNode {
        return (
            <div ref={(node: HTMLDivElement) => this.node = node} style={
                {
                    top:this.state.itemPosition.y+'px',
                    left:this.state.itemPosition.x+'px',
                    width:this.state.itemSize.width+'px',
                    height:this.state.itemSize.height+'px'
                }
            } className='interact-item'>
                {this.props.children}
            </div>
        )

    }
}


