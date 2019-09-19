import React from 'react';
import ReactDOM from "react-dom";
import { ENGINE_METHOD_DSA } from 'constants';
import { number } from 'prop-types';


class Point
{
    x: number;
    y: number;

    constructor(x:number, y:number)
    {
        this.x = x;
        this.y = y;
    }
}

class MotionFrame
{
    position: Point;
    private _timeMs!: number;  // the time in milliseconds relative to the start of the motion

    constructor( position:Point, timeMs:number)
    {
        console.log(`Creating new MotionFrame at ${timeMs}`)
        this.position = position;
        this.timeMs = timeMs;
    }

    get timeMs():number
    {
        return this._timeMs;
    }

    set timeMs(timeMs:number)
    {
        this._timeMs = timeMs;
    }

}

class Motion
{
    private _startTimeMs!: number; //Milliseconds elapsed since the start of the drill
    private _endTimeMs!: number;  // Milliseconds elapsed since the start of the drill
    private _frames: Array<MotionFrame>;

    constructor(startTimeMs: number)
    {
        console.log(`Creating new Motion at ${startTimeMs}`)
        this.startTimeMs = startTimeMs;
        this.endTimeMs = startTimeMs;
        this._frames = [];
    }

     
    get startTimeMs():number
    {
        return this._startTimeMs;
    }

     set startTimeMs(startTime:number)
     {
         this._startTimeMs = startTime;
     }

     get endTimeMs():number
    {
        return this._endTimeMs;
    }

     set endTimeMs(endTime:number)
     {
         this._endTimeMs = endTime;
     }

     addFrame(frame:MotionFrame)
     {
         this._frames.push(frame);
     }

     get frames():MotionFrame[]
     {
         return this._frames;
     }

}

interface BoardProps{

}

interface BoardState{

}

export class Board extends React.Component<BoardProps,BoardState> 
{
    private canvasRef:React.RefObject<HTMLCanvasElement>;
    private motionList:Array<Motion>;
    private activeMotion?:Motion;
    private isPressed:boolean;
    private canvas?:HTMLCanvasElement | null;

    constructor(props:BoardProps)
    {
        super(props);
        this.canvasRef = React.createRef<HTMLCanvasElement>();
        this.motionList = [];
        this.isPressed = false;

        //Bind 'this' to event handler callbacks
        this.onPointerDown = this.onPointerDown.bind(this);
        this.onPointerUp = this.onPointerUp.bind(this);
        this.onPointerMove = this.onPointerMove.bind(this);
    }

    componentDidMount()
    {
        this.onResize();
        this.canvas = this.canvasRef.current;
        window.addEventListener("resize", this.onResize.bind(this));
    }

    render()
    {
        return (
                <div>
                    <canvas id="boardCanvas" ref={this.canvasRef} className="BoardCanvas" onPointerDown={this.onPointerDown} onPointerUp={this.onPointerUp} onPointerMove={this.onPointerMove}/>
                </div>
        );
    }

    draw():void
    {
        if(this.canvas && this.activeMotion)
        {
            let ctx = this.canvas.getContext("2d");
              
            this.motionList.forEach((motion:Motion, index:number) =>
            {
                if(ctx)
                { 
                    ctx.beginPath();
                    motion.frames.forEach((frame:MotionFrame, index:number) =>
                    {
                        if(ctx && this.canvas)
                        {   
                            let x = frame.position.x * this.canvas.width;
                            let y = frame.position.y * this.canvas.height;
                            if(index === 0)
                            {
                                ctx.moveTo(x,y);
                            }
    
                            ctx.lineTo(x,y);
                            ctx.stroke();
                        }
                    });
                }
            });  
            console.log("Draw finished forcing update")
            this.forceUpdate();  
        }
    }

    // Window Events
    onResize(){
        if(this.canvas)
        {
            var fieldMinWidth = 330;  //110 yds x 3
            var fieldMinHeight = 180; //60 yds x 3

            let width = (window.innerWidth > fieldMinWidth) ? window.innerWidth : fieldMinWidth;
            let height = (window.innerHeight > fieldMinHeight) ? window.innerHeight : fieldMinHeight;

            this.canvas.width = width;
            this.canvas.height = height;
            this.draw();
        }
    }

    // Pointer Events
    onPointerDown(event:React.PointerEvent<HTMLCanvasElement>)
    {
        console.log(`onPointerDown`);
        let startTime = new Date().getMilliseconds();
        this.activeMotion = new Motion(startTime);
        this.motionList.push(this.activeMotion);
        this.isPressed = true;
    }

    onPointerUp(event:React.PointerEvent<HTMLCanvasElement>)
    {
        console.log(`onPointerUp`)
        if(this.activeMotion)
        {
            this.activeMotion.endTimeMs = new Date().getMilliseconds();
        }
        this.isPressed = false;
    }

    onPointerMove(event:React.PointerEvent<HTMLCanvasElement>)
    {
        
        if(this.activeMotion && this.isPressed && this.canvas)
        {
            let position = this.getPointerPositionFromCanvasEvent(event, this.canvas);
            console.log(`onPointerMove (${position.x}, ${position.y})`)
            let timeOffset = new Date().getMilliseconds() - this.activeMotion.startTimeMs;
            
            let frame = new MotionFrame(position, timeOffset); 
            this.activeMotion.addFrame(frame);
            this.draw();
        }

    }

    private getPointerPositionFromCanvasEvent(event:React.PointerEvent<HTMLCanvasElement>, canvas:HTMLCanvasElement) : Point
    {
        let offsetPosition = new Point(event.nativeEvent.offsetX,event.nativeEvent.offsetY);
        let position = new Point(offsetPosition.x / canvas.width, offsetPosition.y / canvas.height );
        return position;
    }
}
