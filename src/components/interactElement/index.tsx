import './index.less'
import React, { cloneElement, ReactElement } from 'react'
import interact from 'interactjs'
import type { DraggableOptions, DropzoneOptions, ResizableOptions, Interactable, DragEvent, ResizeEvent,PointerEventType } from '@interactjs/types/index'

export interface InteractProps {
    draggable: boolean
    draggableOptions?: DraggableOptions
    dropzone: boolean
    dropzoneOptions?: DropzoneOptions
    resizable: boolean
    resizableOptions?: ResizableOptions
}



export class InteractElement extends React.Component<InteractProps>{
    node?: HTMLElement
    interact?: Interactable
    draggableOptions: DraggableOptions
    resizableOptions: ResizableOptions
    position: {
        x: number
        y: number
        translateX: number
        translateY: number
    }
    constructor(props: InteractProps) {
        super(props)
        this.position = { x: 0, y: 0, translateX: 0, translateY: 0 }
        this.draggableOptions = {
            onstart:(event: DragEvent)=>{
          
                const target:HTMLElement = event.target as HTMLElement
                if(!target.classList.contains('selected')){
                    target.classList.add('selected')
                }
            },
            onmove: (event: DragEvent) => {
                this.position.translateX += event.dx
                this.position.translateY += event.dy
                const target = event.target as HTMLElement

                target.style.transform = `translate(${this.position.translateX}px, ${this.position.translateY}px)`
                if (typeof props.draggableOptions?.onmove === 'function') {
                    props.draggableOptions.onmove(event)
                }
            },
            onend: (event: DragEvent) => {
                const n_x = this.position.translateX + this.position.x
                const n_y = this.position.translateY + this.position.y
                this.position.x = n_x
                this.position.y = n_y

                // update
                event.target.style.left = n_x + 'px'
                event.target.style.top = n_y + 'px'
                event.target.style.transform = ''

                // reset
                this.position.translateX = 0
                this.position.translateY = 0

                const target = event.target as HTMLElement
                if(!target.classList.contains('selected')){
                    target.classList.add('selected')
                }

            }
        }
        this.resizableOptions = {
            margin: 4,
            edges: Object.assign({ bottom: true, right: true, top: true, left: true }, props.resizableOptions?.edges),
            invert: props.resizableOptions?.invert || 'reposition',
            onmove: (event: ResizeEvent) => {
                console.log(111111)

                console.log(event)
                if (typeof props.resizableOptions?.onmove === 'function') {
                    props.resizableOptions.onmove(event)
                }
            }

        }


    }

    setInteractions() {
        if (this.props.draggable) {
            this.interact?.draggable(this.draggableOptions)
        }

        // if (this.props.dropzone){
        //     this.interact?.dropzone(this.dropzoneOptions)
        // } 
        if (this.props.resizable){
            this.interact?.resizable(this.resizableOptions)
        }
          
        this.interact?.on('tap',(event:PointerEvent)=>{
            const target = event.target as HTMLElement
            target.classList.add('selected')
            
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

            <div ref={(node: HTMLDivElement) => this.node = node} className='interact-item'>
                {this.props.children}
            </div>

        )

    }
}


