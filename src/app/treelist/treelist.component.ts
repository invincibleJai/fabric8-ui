import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';

import {
  TreeComponent
} from 'angular2-tree-component';

// See docs: https://angular2-tree.readme.io/docs
//
// Supported events:
//
// onEvent - Catch-all event that is triggered on every other event that is triggered
// onInitialized - Triggers after tree model was created
// onMoveNode - This event is fired when drag and dropping a node
// onToggle - Triggers when tree node is expanded or collapsed
// onUpdateData - Triggers after tree model was updated
//
@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'alm-tree-list',
  styleUrls: ['./treelist.component.scss'],
  templateUrl: './treelist.component.html'
})

export class TreeListComponent implements OnInit {
  @Input() listTemplate: TemplateRef<any>;
  @Input() loadTemplate: TemplateRef<any>;
  @Input() nodes: any[] = null;
  @Input() options: any;
  @Input() showExpander: boolean = true;

  @Output('onEvent') onEvent = new EventEmitter();
  @Output('onInitialized') onInitialized = new EventEmitter();
  @Output('onMoveNode') onMoveNode = new EventEmitter();
  @Output('onToggle') onToggle = new EventEmitter();
  @Output('onUpdateData') onUpdateData = new EventEmitter();

  @ViewChild(TreeComponent) tree: TreeComponent;

  constructor() {
  }

  ngOnInit(): void {
  }

  // Events

  handleEvent($event: any): void {
    this.onEvent.emit($event);
  }

  handleInitialized($event: any): void {
    this.onInitialized.emit($event);
  }

  handleMoveNode($event: any): void {
    this.onMoveNode.emit($event);
  }

  handleToggle($event: any): void {
    this.onToggle.emit($event);
  }

  handleUpdateData($event: any): void {
    this.onUpdateData.emit($event);
  }

  // Helper function to update tree when moving items
  updateTree() {
    this.tree.treeModel.update();
  }
}
