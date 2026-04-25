import { removeColorCodingFromWord } from "src/strings/utils";
import { Frame } from "w3ts";
import { Components } from "../frame-components";
import { FrameUtils } from "../frame-utils";
import { Panel } from "../panels/panel";
import { Text } from "../text/text";

/**
 * The purpose of the class is to be be able to walk through the children of a frame and toggle their visibility.
 */
export class FrameNavigator {
    context: number;
    name: string;
    owner: Frame;
    containerFrame?: Frame;

    private title?: Frame;
    /**
     * This will be something like this ... root/0/3/1/2
     *
     * Basically that will be where we are at in the tree.
     */
    private pathStringFrame?: Frame;
    /**
     * This will display the number of children of the current frame node we are observing
     */
    private childCountText?: Frame;
    private siblingCountText?: Frame;

    /**
     * For traversing the tree
     */
    private descendBtn?: Frame;
    private canDescend: boolean = false;
    private ascendBtn?: Frame;
    private canAscend: boolean = false;

    /**
     * For observing sibling frames
     */
    private nextChildGlueBtn?: Frame;
    private canViewNext: boolean = false;

    private prevChildGlueBtn?: Frame;
    private canViewPrev: boolean = false;

    private toggleVisibilityBtn?: Frame;

    private currentFrame?: Frame;
    private rootFrame?: Frame;

    /**
     * Referenced in navigation to see if were at root level still. This way we don't attempt to access the root at level 0
     */
    private currentDepth: number = 0;

    /**
     * This is the active child index of the parent of our current frame.
     * Can probably remove this now that we have an array
     */
    private currentChildIndex: number = 0;
    private childAtDepth: number[] = [];

    constructor(context: number, name: string, owner: Frame) {
        this.context = context;
        this.name = name;
        this.owner = owner;
        this.render();
    }

    private render() {
        this.containerFrame = Panel.Render(this.context, this.name + "backdrop", this.owner);
        this.containerFrame?.clearPoints();
        this.containerFrame?.setAbsPoint(FRAMEPOINT_CENTER, 0.4, 0.35);
        this.containerFrame?.setSize(0.2, 0.15);

        if (!this.containerFrame) {
            return;
        }

        this.title = Text.Render(this.context, this.name + "Title", this.containerFrame);
        this.title?.setText("Frame Navigator");
        this.title?.clearPoints();
        this.title?.setPoint(FRAMEPOINT_TOP, this.containerFrame, FRAMEPOINT_TOP, 0, -0.008);

        if (!this.title) {
            return;
        }

        this.pathStringFrame = Text.Render(this.context, this.name + "pathString", this.containerFrame);
        this.pathStringFrame?.setText("root/0");
        this.pathStringFrame?.clearPoints();
        this.pathStringFrame?.setPoint(FRAMEPOINT_TOP, this.title, FRAMEPOINT_BOTTOM, 0, -0.008);

        if (!this.pathStringFrame) {
            return;
        }

        this.siblingCountText = Text.Render(this.context, this.name + "pathString", this.containerFrame);
        this.siblingCountText?.setText("Sibling: 0");
        this.siblingCountText?.clearPoints();
        this.siblingCountText?.setPoint(FRAMEPOINT_TOP, this.pathStringFrame, FRAMEPOINT_BOTTOM, 0, -0.008);

        if (!this.siblingCountText) {
            return;
        }

        this.childCountText = Text.Render(this.context, this.name + "pathString", this.containerFrame);
        this.childCountText?.setText("Children: 0");
        this.childCountText?.clearPoints();
        this.childCountText?.setPoint(FRAMEPOINT_TOP, this.siblingCountText, FRAMEPOINT_BOTTOM, 0, -0.008);

        this.toggleVisibilityBtn = Components.GlueTextButton(this.context, this.name + "visibilityBtn", this.containerFrame, () => {
            this.setVisibility();
        });
        this.toggleVisibilityBtn?.clearPoints();
        this.toggleVisibilityBtn?.setPoint(FRAMEPOINT_BOTTOM, this.containerFrame, FRAMEPOINT_BOTTOM, 0, 0.025);
        this.toggleVisibilityBtn?.setSize(0.06, 0.02);
        this.toggleVisibilityBtn?.setText("Visibility");

        if (!this.toggleVisibilityBtn) {
            return;
        }

        this.ascendBtn = Components.GlueTextButton(this.context, this.name + "ascendBtn", this.containerFrame, () => {
            this.ascendTree();
        });
        this.ascendBtn?.clearPoints();
        this.ascendBtn?.setPoint(FRAMEPOINT_BOTTOM, this.toggleVisibilityBtn, FRAMEPOINT_TOP, 0, 0);
        this.ascendBtn?.setSize(0.06, 0.02);
        this.ascendBtn?.setText("Ascend");

        this.descendBtn = Components.GlueTextButton(this.context, this.name + "descendBtn", this.containerFrame, () => {
            this.descendTree();
        });
        this.descendBtn?.clearPoints();
        this.descendBtn?.setPoint(FRAMEPOINT_TOP, this.toggleVisibilityBtn, FRAMEPOINT_BOTTOM, 0, 0);
        this.descendBtn?.setSize(0.06, 0.02);
        this.descendBtn?.setText("Descend");

        this.prevChildGlueBtn = Components.GlueTextButton(this.context, this.name + "prevChild", this.containerFrame, () => {
            this.selectPrevChild();
        });
        this.prevChildGlueBtn?.clearPoints();
        this.prevChildGlueBtn?.setPoint(FRAMEPOINT_RIGHT, this.toggleVisibilityBtn, FRAMEPOINT_LEFT, 0, 0);
        this.prevChildGlueBtn?.setSize(0.025, 0.02);
        this.prevChildGlueBtn?.setText("<<");

        this.nextChildGlueBtn = Components.GlueTextButton(this.context, this.name + "nextChild", this.containerFrame, () => {
            this.selectNextChild();
        });
        this.nextChildGlueBtn?.clearPoints();
        this.nextChildGlueBtn?.setPoint(FRAMEPOINT_LEFT, this.toggleVisibilityBtn, FRAMEPOINT_RIGHT, 0, 0);
        this.nextChildGlueBtn?.setSize(0.025, 0.02);
        this.nextChildGlueBtn?.setText(">>");
    }

    private setVisibility() {
        print("Toggling Visibility");
        this.currentFrame?.setVisible(!this.currentFrame.visible);
        if (this.currentFrame?.text !== undefined && this.currentFrame.text !== "") {
            print("Frame text: " + this.currentFrame.text);
        }
    }

    private selectNextChild() {
        if (!this.canViewNext) {
            return;
        }
        print("Next");

        //Validation should have occurred at this.setCurrentFrame so this is safe without additional validation.
        this.currentChildIndex++;
        this.childAtDepth[this.currentDepth] = this.currentChildIndex;

        if (this.currentFrame === this.rootFrame || this.currentDepth === 0) {
            this.setCurrentFrame(this.rootFrame?.getChild(this.currentChildIndex));
        } else {
            this.setCurrentFrame(this.currentFrame?.getParent()?.getChild(this.currentChildIndex));
        }
    }

    private selectPrevChild() {
        if (!this.canViewPrev) {
            return;
        }
        print("Prev");

        //Validation should have occurred at this.setCurrentFrame so this is safe without additional validation.
        this.currentChildIndex--;
        this.childAtDepth[this.currentDepth] = this.currentChildIndex;

        if (this.currentFrame === this.rootFrame || this.currentDepth === 0) {
            this.setCurrentFrame(this.rootFrame?.getChild(this.currentChildIndex));
        } else {
            this.setCurrentFrame(this.currentFrame?.getParent()?.getChild(this.currentChildIndex));
        }
    }

    private ascendTree() {
        if (!this.canAscend) {
            return;
        }
        print("Ascend");
        //if we are ascending, we don't always know what index we are
        this.currentDepth--;
        this.currentChildIndex = this.childAtDepth[this.currentDepth];
        //remove the last child
        this.childAtDepth.pop();

        const parent = this.currentFrame?.getParent();

        if (!parent) {
            print("NO PARENT WHEN ASCENDING!");
        } else {
            this.setCurrentFrame(this.currentFrame?.getParent());
        }
    }

    private descendTree() {
        if (!this.canDescend) {
            return;
        }
        print("Descend");

        if (this.currentFrame && this.currentFrame?.childrenCount > 0) {
            this.currentChildIndex = 0;
            this.currentDepth++;
            this.childAtDepth.push(0);
            this.setCurrentFrame(this.currentFrame.getChild(0));
        } else {
            print("CANNOT DESCEND: No children!");
        }
    }

    public setRoot(frame: Frame) {
        this.rootFrame = frame;
        this.pathStringFrame?.setText("root/0");
        this.childAtDepth.push(0);
        this.setCurrentFrame(frame);
    }

    /**
     * This should be the last thing you call in the other actions as it's dependent on other members being up to date for the current frame
     * @param frame
     * @returns
     */
    private setCurrentFrame(frame?: Frame) {
        if (!frame) {
            return;
        }
        this.currentFrame = frame;

        this.canAscend = this.currentDepth !== 0;
        // this.canAscend = this.currentFrame !== this.rootFrame && this.currentDepth !== 0;
        this.canDescend = this.currentDepth === 0 ? this.rootFrame?.childrenCount !== 0 : frame.childrenCount !== 0;

        //root frame has it's own condition to avoid accessing parent
        if (this.currentFrame === this.rootFrame) {
            //should only be able to descend
            this.canViewNext = false;
        } else if (this.currentDepth === 0 && this.rootFrame) {
            this.canViewNext = this.currentChildIndex < this.rootFrame.childrenCount;
        } else if (this.currentFrame.getParent() !== undefined) {
            //The parent must have more than 1 child and the currently viewed child of the children must not be the last sibling child of the parent
            this.canViewNext = this.currentFrame.parent.childrenCount > 1 && this.currentChildIndex < this.currentFrame.parent.childrenCount - 1;
        } else {
            //should only happen in root frame where we do not have a parent. specifically our roots are always origin frames, since they shoulnd't have parents (?)
            this.canViewNext = false;
        }

        //When setting frame, we always start at child 0 of the parent so there will never be a previous sibling.
        if (this.currentChildIndex !== 0 && this.currentFrame !== this.rootFrame) {
            this.canViewPrev = true;
        } else {
            //root frame will never view prev since it's an origin frame and has no siblings
            this.canViewPrev = false;
        }

        const textFrameEnabledMap = new Map([
            [this.ascendBtn, this.canAscend],
            [this.descendBtn, this.canDescend],
            [this.nextChildGlueBtn, this.canViewNext],
            [this.prevChildGlueBtn, this.canViewPrev],
        ]);

        textFrameEnabledMap.forEach((enabled, textFrame) => {
            if (enabled === false) {
                textFrame?.setText(`|cff999999${removeColorCodingFromWord(textFrame.text)}|r`);
            } else {
                textFrame?.setText(`|cffffffff${removeColorCodingFromWord(textFrame.text)}|r`);
            }
        });

        this.childCountText?.setText("Children: " + this.currentFrame.childrenCount);

        if (this.currentDepth !== 0) {
            this.siblingCountText?.setText("Sibling: " + ((this.currentFrame.getParent()?.childrenCount || 0) - 1));
        } else if (this.currentFrame === this.rootFrame) {
            this.siblingCountText?.setText("Sibling: 0");
        } else {
            this.siblingCountText?.setText("Sibling: " + ((this.rootFrame?.getParent()?.childrenCount || 0) - 1));
        }

        this.updatePath();
    }

    private updatePath() {
        const copy = this.childAtDepth.slice();
        copy.shift();

        const newPath = "root" + "/" + copy.join("/");

        this.pathStringFrame?.setText(newPath);
    }
}

export function initFrameViewer() {
    const navigator = new FrameNavigator(0, "frame-navigator", FrameUtils.OriginFrameGameUI);
    const console = Frame.fromHandle(BlzGetFrameByName("ConsoleUI", 0));

    if (console) {
        navigator.setRoot(console);
    }
}
