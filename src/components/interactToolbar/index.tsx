import React from "react"

interface InteractToolbarProp{
    selector:boolean
    shape:boolean
    text:boolean
}
type InteractToolbarState = Record<string,never>
export class InteractToolbar extends React.Component<InteractToolbarProp,InteractToolbarState>{
    
}