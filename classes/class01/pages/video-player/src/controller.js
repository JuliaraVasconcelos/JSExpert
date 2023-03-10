
export default class Controller {
    #view
    #camera
    #worker
    #blinkLeftCounter = 0;
    #blinkRightCounter = 0;
    #blinkCounter = 0

    constructor({ view, worker, camera }) {
        this.#view = view
        this.#camera = camera
        this.#worker = this.#configureWorker(worker)

        this.#view.configureOnBtnClick(this.onBtnStart.bind(this))
    }

    static async initialize(deps) {
        const controller = new Controller(deps)
        controller.log('eye blink not detected, click in the button to start')
        return controller.init()
    }

    #configureWorker(worker) {
        let ready = false
        worker.onmessage = ({ data }) => {
            if('READY' === data){
                console.log('worker is ready');
                this.#view.enableButton()
                ready = true
                return;
            }

            // const blinked = data.blinked
            // this.#blinkCounter += blinked
            // this.#view.tooglePlayVideo()
            // console.log('blinked', blinked);

            const leftBlink = data.leftBlink;
            const rightBlink = data.rightBlink;
            if (!leftBlink && !rightBlink) return;

            this.#blinkCounter += leftBlink || rightBlink;

            if (leftBlink && !rightBlink) this.#view.tooglePlayVideo();
            

            console.log('blinked left', leftBlink);
            console.log('blinked right', rightBlink);

        }
        return {
            send(msg) {
                if(!ready) return;
                worker.postMessage(msg)
            }
        }
    }

    async init() {
        console.log('init');
        // this.#worker.postMessage('CONTROLLER')
    }

    loop(){
        const video = this.#camera.video
        const img = this.#view.getVideoFrame(video)
        this.#worker.send(img)
        this.log(`detecting eye blink`)
        
        setTimeout(() => this.loop(), 100)
    }

    log(text) {

        // const times = `     - blinked times: ${this.#blinkCounter}`
        // this.#view.log(`status: ${text}`.concat(this.#blinkCounter ? times : ''))

        const timesRight = `        - blink time: ${this.#blinkRightCounter}`
        const timesLeft = `        - blink time: ${this.#blinkLeftCounter}`
        this.#view.log(`status: ${text}`.concat(this.#blinkRightCounter ? timesRight : "").concat(this.#blinkLeftCounter ? timesLeft : ""))
    }
    
    onBtnStart() {
        // this.log('initializing detection...')
        // this.#blinkCounter = 0
        // this.loop()

        this.log('initializing detection...')
        this.#blinkLeftCounter = 0;
        this.#blinkRightCounter = 0;
        this.loop()
    }
}