// export class Text extends AbstractFrameBase {
//     public frame?: Frame;

//     constructor(...baseArgs: ConstructorParameters<typeof AbstractFrameBase>) {
//         super(...baseArgs);

//         this.render();
//     }

//     protected render() {
//         //Doesn't need to inherit from anyone.
//         this.frame = Frame.fromHandle(BlzCreateFrameByType("TEXT", this.name, this.owner.handle, "", this.context));

//         if (!this.frame) {
//             return;
//         }

//         this.frame.clearPoints();
//         this.frame.setAbsPoint(FRAMEPOINT_CENTER, 0.4, 0.3);
//         this.frame.setSize(0.1, 0.005);
//         this.frame.setText("Sample Text");
//     }

//     /**
//      * Returns a computed width for the tooltip
//      *
//      * @param text The text that goes inside the tooltip.
//      * @param buffer Optional addition to the calculated width.
//      * @returns number
//      */
//     static FormatSize(text: string, buffer?: number) {
//         return 0.02 + 0.004 * text.length + (buffer || 0);
//     }
// }
