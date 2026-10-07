import { Frame } from "w3ts";
import {
    BackdropFrame,
    ButtonFrame,
    EmptyFrame,
    GlueTextButtonFrame,
    IconFrame,
    TextAreaFrame,
    TextFrame,
    TimerFrame,
    TooltipFrame,
} from "../components";
import { FrameUtils } from "../frame-utils";

interface FrameComponentTest {
    frame?: Frame;
    label: string;
    create: () => Frame | undefined;
}

interface FrameComponentTestPage {
    label: string;
    menuLabel: string;
    tests: FrameComponentTest[];
}

interface PageButton {
    button: GlueTextButtonFrame;
    page: number;
}

/**
 * Persistent UI for manually testing every exported MonoFrame and CompositeFrame.
 *
 * Test frames are created only on their first invocation. Later invocations only
 * toggle the cached root frame's visibility; frames are never deleted.
 */
export class FrameComponentTestHarness {
    public readonly context: number;
    public readonly name: string;
    public readonly owner: Frame;

    public containerFrame?: Frame;

    private readonly pages: FrameComponentTestPage[];
    private readonly componentButtons: PageButton[] = [];
    private readonly testButtons: PageButton[] = [];
    private readonly navigationButtons: GlueTextButtonFrame[] = [];

    private launcherButton?: ButtonFrame;
    private minimizeButton?: GlueTextButtonFrame;
    private pageDescription?: TextFrame;
    private pageTitle?: TextFrame;
    private visibleTest?: FrameComponentTest;
    private currentPage = 0;

    public constructor(context = 0, name = "FrameComponentTestHarness", owner: Frame = FrameUtils.OriginFrameGameUI) {
        this.context = context;
        this.name = name;
        this.owner = owner;
        this.pages = this.createPages();
        this.render();
    }

    private render(): void {
        const container = BackdropFrame.CreateType({
            context: this.context,
            inherits: "QuestButtonBaseTemplate",
            name: `${this.name}Container`,
            owner: this.owner,
        });
        this.containerFrame = container.frame;
        if (!this.containerFrame) {
            return;
        }

        this.containerFrame.clearPoints();
        this.containerFrame.setAbsPoint(FRAMEPOINT_CENTER, 0.2, 0.4);
        this.containerFrame.setSize(0.32, 0.28);

        this.pageTitle = TextFrame.CreateType({
            context: this.context,
            inherits: "",
            name: `${this.name}Title`,
            owner: this.containerFrame,
            overrides: {
                autoSizeWidth: false,
                initialText: "Frame Component Test Harness",
            },
        });
        const titleFrame = this.pageTitle.frame;
        titleFrame?.clearPoints();
        titleFrame?.setPoint(FRAMEPOINT_TOP, this.containerFrame, FRAMEPOINT_TOP, 0, -0.015);
        titleFrame?.setSize(0.28, 0.025);
        titleFrame?.setEnabled(false);

        this.pageDescription = TextFrame.CreateType({
            context: this.context,
            inherits: "",
            name: `${this.name}PageDescription`,
            owner: this.containerFrame,
            overrides: {
                autoSizeWidth: false,
                initialText: "Select a frame component to test.",
            },
        });
        const descriptionFrame = this.pageDescription.frame;
        descriptionFrame?.clearPoints();
        descriptionFrame?.setPoint(FRAMEPOINT_TOP, titleFrame ?? this.containerFrame, FRAMEPOINT_BOTTOM, 0, -0.012);
        descriptionFrame?.setSize(0.28, 0.02);
        descriptionFrame?.setEnabled(false);

        this.createComponentButtons();
        this.createTestButtons();
        this.createNavigationButtons();
        this.createLauncherButton();
        this.showPage(0);
    }

    private createComponentButtons(): void {
        const containerFrame = this.containerFrame;
        if (!containerFrame) {
            return;
        }

        this.pages.forEach((page, index) => {
            const button = this.createMenuButton(`${this.name}Component${index}`, page.menuLabel, () => this.showPage(index + 1));
            if (!button.frame) {
                return;
            }

            const column = index % 3;
            const row = Math.floor(index / 3);
            button.frame.clearPoints();
            button.frame.setPoint(FRAMEPOINT_TOPLEFT, containerFrame, FRAMEPOINT_TOPLEFT, 0.012 + column * 0.102, -0.065 - row * 0.04);
            button.frame.setSize(0.09, 0.028);
            this.componentButtons.push({ button, page: index + 1 });
        });
    }

    private createTestButtons(): void {
        const containerFrame = this.containerFrame;
        if (!containerFrame) {
            return;
        }
        const testButtonAnchor = this.pageDescription?.frame ?? containerFrame;

        this.pages.forEach((page, pageIndex) => {
            page.tests.forEach((test, testIndex) => {
                const button = this.createMenuButton(`${this.name}${page.label.replace("Frame", "")}Test${testIndex}`, test.label, () => this.toggleTest(test));
                if (!button.frame) {
                    return;
                }

                button.frame.clearPoints();
                button.frame.setPoint(FRAMEPOINT_TOP, testButtonAnchor, FRAMEPOINT_BOTTOM, 0, -0.018 - testIndex * 0.04);
                button.frame.setSize(0.2, 0.028);
                this.testButtons.push({ button, page: pageIndex + 1 });
            });
        });
    }

    private createNavigationButtons(): void {
        if (!this.containerFrame) {
            return;
        }

        const previous = this.createMenuButton(`${this.name}Previous`, "<", () => this.showPreviousPage());
        const home = this.createMenuButton(`${this.name}Home`, "Home", () => this.showPage(0));
        const next = this.createMenuButton(`${this.name}Next`, ">", () => this.showNextPage());
        const minimize = GlueTextButtonFrame.CreateType({
            context: this.context,
            inherits: "ScriptDialogButton",
            name: `${this.name}Minimize`,
            owner: this.owner,
            overrides: {
                initialText: "-",
                onClick: () => this.minimize(),
            },
        });

        previous.frame?.clearPoints();
        previous.frame?.setPoint(FRAMEPOINT_BOTTOM, this.containerFrame, FRAMEPOINT_BOTTOM, -0.075, 0.012);
        previous.frame?.setSize(0.03, 0.024);
        home.frame?.clearPoints();
        home.frame?.setPoint(FRAMEPOINT_BOTTOM, this.containerFrame, FRAMEPOINT_BOTTOM, 0, 0.012);
        home.frame?.setSize(0.09, 0.024);
        next.frame?.clearPoints();
        next.frame?.setPoint(FRAMEPOINT_BOTTOM, this.containerFrame, FRAMEPOINT_BOTTOM, 0.075, 0.012);
        next.frame?.setSize(0.03, 0.024);
        if (minimize.frame) {
            this.positionUnderQuestsButton(minimize.frame);
        }
        minimize.frame?.setSize(0.03, 0.024);

        this.navigationButtons.push(previous, home, next, minimize);
        this.minimizeButton = minimize;
    }

    private createLauncherButton(): void {
        this.launcherButton = ButtonFrame.CreateType({
            context: this.context,
            inherits: "",
            name: `${this.name}Launcher`,
            owner: this.owner,
            overrides: {
                onClick: () => this.restore(),
                texture: "ReplaceableTextures\\CommandButtons\\BTNSelectHeroOn",
            },
        });
        if (this.launcherButton.frame) {
            this.positionUnderQuestsButton(this.launcherButton.frame);
        }
        this.launcherButton.frame?.setSize(0.03, 0.03);
        this.launcherButton.frame?.setVisible(false);

        if (this.launcherButton.frame) {
            TooltipFrame.Create({
                context: this.context,
                name: `${this.name}LauncherTooltip`,
                owner: this.launcherButton.frame,
                overrides: {
                    anchorPoint: "bottom",
                    bodyText: "Open the frame component test harness.",
                    headerText: "Test Menu",
                    includeBackground: true,
                },
            });
        }
    }

    private positionUnderQuestsButton(frame: Frame): void {
        frame.clearPoints();
        const questsButton = Frame.fromName("UpperButtonBarQuestsButton", 0);
        if (questsButton) {
            frame.setPoint(FRAMEPOINT_TOPLEFT, questsButton, FRAMEPOINT_BOTTOMLEFT, 0, -0.004);
            return;
        }

        frame.setPoint(FRAMEPOINT_TOPLEFT, this.owner, FRAMEPOINT_TOPLEFT, 0.15, -0.045);
    }

    private createMenuButton(name: string, text: string, onClick: () => void): GlueTextButtonFrame {
        return GlueTextButtonFrame.CreateType({
            context: this.context,
            inherits: "ScriptDialogButton",
            name,
            owner: this.containerFrame,
            overrides: {
                initialText: text,
                onClick,
            },
        });
    }

    private showPage(page: number): void {
        this.hideTests();
        this.currentPage = page;

        const isHomePage = page === 0;
        this.componentButtons.forEach(({ button }) => button.frame?.setVisible(isHomePage));
        this.testButtons.forEach(({ button, page: buttonPage }) => button.frame?.setVisible(buttonPage === page));

        if (isHomePage) {
            this.pageTitle?.update("Frame Component Test Harness");
            this.pageDescription?.update("Select a frame component to test.");
            return;
        }

        const componentPage = this.pages[page - 1];
        if (!componentPage) {
            this.showPage(0);
            return;
        }

        this.pageTitle?.update(componentPage.label);
        this.pageDescription?.update("Create a test frame or toggle an existing test.");
    }

    private showPreviousPage(): void {
        const previousPage = this.currentPage <= 1 ? this.pages.length : this.currentPage - 1;
        this.showPage(previousPage);
    }

    private showNextPage(): void {
        const nextPage = this.currentPage >= this.pages.length ? 1 : this.currentPage + 1;
        this.showPage(nextPage);
    }

    private toggleTest(test: FrameComponentTest): void {
        if (this.visibleTest === test && test.frame?.visible) {
            test.frame.setVisible(false);
            this.visibleTest = undefined;
            return;
        }

        this.hideTests();
        if (!test.frame) {
            test.frame = test.create();
            if (!test.frame) {
                print(`Failed to create the "${test.label}" test frame.`);
                return;
            }

            test.frame.clearPoints();
            test.frame.setAbsPoint(FRAMEPOINT_CENTER, 0.6, 0.38);
        }

        test.frame?.setVisible(true);
        this.visibleTest = test.frame ? test : undefined;
    }

    private hideTests(): void {
        this.pages.forEach((page) => page.tests.forEach((test) => test.frame?.setVisible(false)));
        this.visibleTest = undefined;
    }

    private minimize(): void {
        this.hideTests();
        this.containerFrame?.setVisible(false);
        this.minimizeButton?.frame?.setVisible(false);
        this.launcherButton?.frame?.setVisible(true);
    }

    private restore(): void {
        this.containerFrame?.setVisible(true);
        this.minimizeButton?.frame?.setVisible(true);
        this.launcherButton?.frame?.setVisible(false);
        this.showPage(this.currentPage);
    }

    private createPages(): FrameComponentTestPage[] {
        return [
            {
                label: "BackdropFrame",
                menuLabel: "Backdrop",
                tests: [
                    this.test("Create by type", () => BackdropFrame.CreateType({ context: this.context, inherits: "QuestButtonBaseTemplate", name: this.testName("Backdrop", "Type") }).frame),
                    this.test("Create by name", () => BackdropFrame.CreateNamed({ context: this.context, name: "EscMenuBackdrop" }).frame),
                    this.test("Create sized backdrop", () => {
                        const backdrop = BackdropFrame.CreateType({ context: this.context, inherits: "QuestButtonBaseTemplate", name: this.testName("Backdrop", "Sized") });
                        backdrop.frame?.setSize(0.22, 0.12);
                        return backdrop.frame;
                    }),
                ],
            },
            {
                label: "ButtonFrame",
                menuLabel: "Button",
                tests: [
                    this.test("Create by type", () => ButtonFrame.CreateType({ context: this.context, inherits: "", name: this.testName("Button", "Type") }).frame),
                    this.test("Create by name", () => ButtonFrame.CreateNamed({ context: this.context, name: "ScoreScreenTabButtonTemplate" }).frame),
                    this.test("Create click test", () =>
                        ButtonFrame.CreateType({
                            context: this.context,
                            inherits: "",
                            name: this.testName("Button", "Click"),
                            overrides: {
                                onClick: () => print("ButtonFrame test clicked."),
                                texture: "ReplaceableTextures\\CommandButtons\\BTNSelectHeroOn",
                            },
                        }).frame,
                    ),
                ],
            },
            {
                label: "EmptyFrame",
                menuLabel: "Empty",
                tests: [
                    this.test("Create by type", () => this.createEmptyFrameTest(EmptyFrame.CreateType({ context: this.context, inherits: "", name: this.testName("Empty", "Type") }), "EmptyFrame created by type")),
                    this.test("Create by name", () => this.createEmptyFrameTest(EmptyFrame.CreateNamed({ context: this.context, name: "EscMenuBackdrop" }), "EmptyFrame created by name")),
                    this.test("Create container with text", () => this.createEmptyFrameTest(EmptyFrame.CreateType({ context: this.context, inherits: "", name: this.testName("Empty", "Container") }), "EmptyFrame child content")),
                ],
            },
            {
                label: "GlueTextButtonFrame",
                menuLabel: "Glue Button",
                tests: [
                    this.test("Create by type", () => GlueTextButtonFrame.CreateType({ context: this.context, inherits: "ScriptDialogButton", name: this.testName("GlueButton", "Type") }).frame),
                    this.test("Create by name", () => GlueTextButtonFrame.CreateNamed({ context: this.context, name: "ScriptDialogButton" }).frame),
                    this.test("Create custom text", () =>
                        GlueTextButtonFrame.CreateType({
                            context: this.context,
                            inherits: "ScriptDialogButton",
                            name: this.testName("GlueButton", "Text"),
                            overrides: {
                                initialText: "Glue Button Test",
                                onClick: () => print("GlueTextButtonFrame test clicked."),
                            },
                        }).frame,
                    ),
                ],
            },
            {
                label: "IconFrame",
                menuLabel: "Icon",
                tests: [
                    this.test("Create by type", () => IconFrame.CreateType({ context: this.context, inherits: "", name: this.testName("Icon", "Type") }).frame),
                    this.test("Create by name", () => IconFrame.CreateNamed({ context: this.context, name: "ScoreScreenTabButtonTemplate" }).frame),
                    this.test("Create custom texture", () =>
                        IconFrame.CreateType({
                            context: this.context,
                            inherits: "",
                            name: this.testName("Icon", "Texture"),
                            overrides: { texture: "ReplaceableTextures\\CommandButtons\\BTNInfernal.blp" },
                        }).frame,
                    ),
                ],
            },
            {
                label: "TextAreaFrame",
                menuLabel: "Text Area",
                tests: [
                    this.test("Create by type", () =>
                        TextAreaFrame.CreateType({
                            context: this.context,
                            inherits: "JMT_TextAreaTemplate",
                            name: this.testName("TextArea", "Type"),
                            overrides: { initialText: this.scrollableTextAreaContent("Text area created by type.") },
                        }).frame,
                    ),
                    this.test("Create by name", () =>
                        TextAreaFrame.CreateNamed({
                            context: this.context,
                            name: "JMT_TextAreaTemplate",
                            overrides: { initialText: this.scrollableTextAreaContent("Text area created by name.") },
                        }).frame,
                    ),
                    this.test("Create mouse-enter test", () =>
                        TextAreaFrame.CreateType({
                            context: this.context,
                            inherits: "JMT_TextAreaTemplate",
                            name: this.testName("TextArea", "MouseEnter"),
                            overrides: {
                                initialText: this.scrollableTextAreaContent("Move the mouse over this text area."),
                                onMouseEnter: () => print("TextAreaFrame mouse-enter test triggered."),
                            },
                        }).frame,
                    ),
                ],
            },
            {
                label: "TextFrame",
                menuLabel: "Text",
                tests: [
                    this.test("Create by type", () => TextFrame.CreateType({ context: this.context, inherits: "", name: this.testName("Text", "Type") }).frame),
                    this.test("Create by name", () => {
                        const textFrame = TextFrame.CreateNamed({
                            context: this.context,
                            name: "FrameComponentTestTextTemplate",
                            overrides: {
                                autoSizeWidth: false,
                                initialText: "Named TextFrame",
                            },
                        });
                        textFrame.frame?.setSize(0.2, 0.03);
                        return textFrame.frame;
                    }),
                    this.test("Create auto-sized text", () =>
                        TextFrame.CreateType({
                            context: this.context,
                            inherits: "",
                            name: this.testName("Text", "AutoSize"),
                            overrides: {
                                autoSizeWidth: true,
                                initialText: "TextFrame automatic width test",
                            },
                        }).frame,
                    ),
                ],
            },
            {
                label: "TooltipFrame",
                menuLabel: "Tooltip",
                tests: [
                    this.test("Create by type", () => this.createTooltipTest("Type", (owner) => TooltipFrame.CreateTyped({ context: this.context, name: this.testName("Tooltip", "Type"), owner, overrides: this.tooltipConfiguration("Tooltip created by type.") }))),
                    this.test("Create by name", () => this.createTooltipTest("Named", (owner) => TooltipFrame.CreateNamed({ context: this.context, name: this.testName("Tooltip", "Named"), owner, overrides: this.tooltipConfiguration("Tooltip created by name.") }))),
                    this.test("Create resource grid", () =>
                        this.createTooltipTest("Grid", (owner) =>
                            TooltipFrame.Create({
                                context: this.context,
                                name: this.testName("Tooltip", "Grid"),
                                owner,
                                overrides: {
                                    ...this.tooltipConfiguration("Hover the button to inspect the tooltip grid."),
                                    tooltipIconContainerGapX: 0.005,
                                    tooltipIconGridData: [
                                        { texture: "ReplaceableTextures\\CommandButtons\\BTNTichondrius.blp", value: "100" },
                                        { texture: "ReplaceableTextures\\CommandButtons\\BTNGargoyle.blp", value: "50" },
                                        { texture: "ReplaceableTextures\\CommandButtons\\BTNInfernal.blp", value: "15" },
                                    ],
                                    tooltipIconValueLeftPadding: 0,
                                },
                            }),
                        ),
                    ),
                ],
            },
            {
                label: "TimerFrame",
                menuLabel: "Timer",
                tests: [
                    this.test("Create by type", () => TimerFrame.CreateTyped({ context: this.context, name: this.testName("Timer", "Type"), overrides: { timerTitle: "Typed timer" } }).containerFrame),
                    this.test("Create by name", () => TimerFrame.CreateNamed({ context: this.context, name: this.testName("Timer", "Named"), overrides: { timerTitle: "Named timer" } }).containerFrame),
                    this.test("Create countdown", () => {
                        const timer = TimerFrame.Create({
                            context: this.context,
                            name: this.testName("Timer", "Countdown"),
                            overrides: {
                                iconTexture: "ReplaceableTextures\\CommandButtons\\BTNInfernal.blp",
                                iconTooltipText: "Timer test icon",
                                timerTitle: "Countdown",
                            },
                        });
                        timer.start(30, false, () => print("TimerFrame test countdown completed."));
                        return timer.containerFrame;
                    }),
                ],
            },
        ];
    }

    private createEmptyFrameTest(emptyFrame: EmptyFrame, text: string): Frame | undefined {
        const frame = emptyFrame.frame;
        if (!frame) {
            return undefined;
        }

        frame.setSize(0.2, 0.06);
        const textFrame = TextFrame.CreateType({
            context: this.context,
            inherits: "",
            name: `${this.name}${text.replaceAll(" ", "")}`,
            owner: frame,
            overrides: { initialText: text },
        });
        textFrame.frame?.clearPoints();
        textFrame.frame?.setPoint(FRAMEPOINT_CENTER, frame, FRAMEPOINT_CENTER, 0, 0);
        textFrame.frame?.setEnabled(false);
        return frame;
    }

    private createTooltipTest(label: string, createTooltip: (owner: Frame) => TooltipFrame): Frame | undefined {
        const anchor = ButtonFrame.CreateType({
            context: this.context,
            inherits: "",
            name: this.testName("TooltipAnchor", label),
            overrides: {
                texture: "ReplaceableTextures\\CommandButtons\\BTNSelectHeroOn",
            },
        });
        if (!anchor.frame) {
            return undefined;
        }

        anchor.frame.setSize(0.04, 0.04);
        createTooltip(anchor.frame);
        return anchor.frame;
    }

    private tooltipConfiguration(bodyText: string) {
        return {
            bodyText,
            headerText: "TooltipFrame Test",
            includeBackground: true,
        };
    }

    private scrollableTextAreaContent(firstLine: string): string {
        return [
            firstLine,
            "02: Scroll with the mouse wheel.",
            "03: This line is intentionally short.",
            "04: The scrollbar should be visible.",
            "05: Text areas retain multiple lines.",
            "06: Each line contributes to overflow.",
            "07: Keep scrolling through the content.",
            "08: The custom template has a border.",
            "09: Mouse input reaches this frame.",
            "10: Wheel input moves the scrollbar.",
            "11: The visible area is deliberately small.",
            "12: This verifies the line height setting.",
            "13: This verifies the line gap setting.",
            "14: This verifies the text-area inset.",
            "15: This is more content to scroll.",
            "16: End of the TextAreaFrame test.",
        ].join("\n");
    }

    private test(label: string, create: () => Frame | undefined): FrameComponentTest {
        return { create, label };
    }

    private testName(component: string, test: string): string {
        return `${this.name}${component}${test}`;
    }
}
