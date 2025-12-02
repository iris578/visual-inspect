// VisBug - Visual Development Tools
// Extracted from Differ macOS app and adapted for browser extension

(function() {
    'use strict';

    // Prevent multiple injections
    if (window.visbug) {
        console.log('VisBug already loaded');
        return;
    }

    window.visbug = {
        currentTool: 'inspect',
        expandedSiblings: new Set(),

        activate: function() {
            // Create main VisBug toolbar
            const toolbar = document.createElement('div');
            toolbar.setAttribute('data-visbug', 'toolbar');
            toolbar.style.cssText = `
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: #1a1a1a;
                border: 1px solid #333;
                border-radius: 8px;
                padding: 8px;
                display: flex;
                gap: 4px;
                z-index: 999999;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            `;

            const tools = [
                { name: 'inspect', icon: '🔍', title: 'Inspect Element' },
                { name: 'spacing', icon: '📐', title: 'Spacing' },
                { name: 'color', icon: '🎨', title: 'Color Picker' },
                { name: 'font', icon: '🔤', title: 'Font Inspector' }
            ];

            tools.forEach(tool => {
                const btn = document.createElement('button');
                btn.setAttribute('data-visbug', 'tool-' + tool.name);
                btn.style.cssText = `
                    background: ${tool.name === this.currentTool ? '#78E2FF' : '#2a2a2a'};
                    border: none;
                    color: white;
                    padding: 8px 12px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 16px;
                    transition: background 0.2s;
                    min-width: 40px;
                `;
                btn.textContent = tool.icon;
                btn.title = tool.title;

                btn.addEventListener('click', () => this.setTool(tool.name));
                toolbar.appendChild(btn);
            });

            // Add close button
            const closeBtn = document.createElement('button');
            closeBtn.setAttribute('data-visbug', 'close');
            closeBtn.style.cssText = `
                background: #666;
                border: none;
                color: white;
                padding: 8px 12px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 16px;
                margin-left: 8px;
            `;
            closeBtn.textContent = '✕';
            closeBtn.title = 'Close VisBug';
            closeBtn.addEventListener('click', () => this.deactivate());
            toolbar.appendChild(closeBtn);

            document.body.appendChild(toolbar);
            this.setTool('inspect');
        },

        setTool: function(toolName) {
            this.currentTool = toolName;

            // Update button states
            document.querySelectorAll('[data-visbug^="tool-"]').forEach(btn => {
                btn.style.background = btn.getAttribute('data-visbug') === 'tool-' + toolName ? '#78E2FF' : '#2a2a2a';
            });

            // Clear previous tool effects
            this.clearEffects();

            // Apply tool effects
            switch(toolName) {
                case 'inspect':
                    this.enableInspect();
                    break;
                case 'guides':
                    this.enableGuides();
                    break;
                case 'color':
                    this.enableColorPicker();
                    break;
                case 'spacing':
                    this.enableSpacing();
                    break;
                case 'font':
                    this.enableFontInspector();
                    break;
            }
        },

        clearEffects: function() {
            // Remove stored event listeners
            if (this.mouseoverHandler) {
                document.removeEventListener('mouseover', this.mouseoverHandler);
                this.mouseoverHandler = null;
            }
            if (this.mouseoutHandler) {
                document.removeEventListener('mouseout', this.mouseoutHandler);
                this.mouseoutHandler = null;
            }
            if (this.clickHandler) {
                document.removeEventListener('click', this.clickHandler, true);
                this.clickHandler = null;
            }
            // Remove spacing event listeners
            if (this.spacingMouseoverHandler) {
                document.removeEventListener('mouseover', this.spacingMouseoverHandler);
                this.spacingMouseoverHandler = null;
            }
            if (this.spacingMouseoutHandler) {
                document.removeEventListener('mouseout', this.spacingMouseoutHandler);
                this.spacingMouseoutHandler = null;
            }
            document.body.style.cursor = '';
            this.removeHighlight();
            document.querySelectorAll('[data-visbug="guide"], [data-visbug="info"], [data-visbug="hierarchy-panel"]').forEach(el => el.remove());
        },

        enableInspect: function() {
            const self = this;
            // Store event handlers so they can be removed later
            this.mouseoverHandler = function(e) { self.highlightElement(e); };
            this.mouseoutHandler = function(e) { self.removeHighlight(e); };
            this.clickHandler = function(e) { self.selectElement(e); };

            document.addEventListener('mouseover', this.mouseoverHandler);
            document.addEventListener('mouseout', this.mouseoutHandler);
            document.addEventListener('click', this.clickHandler, true);
            document.body.style.cursor = 'crosshair';
        },

        enableColorPicker: function() {
            document.addEventListener('click', this.pickColor, true);
            document.body.style.cursor = 'copy';
        },

        enableSpacing: function() {
            const self = this;
            // Store event handlers so they can be removed later
            this.spacingMouseoverHandler = function(e) { self.showSpacing(e); };
            this.spacingMouseoutHandler = function(e) { self.hideSpacing(e); };

            document.addEventListener('mouseover', this.spacingMouseoverHandler);
            document.addEventListener('mouseout', this.spacingMouseoutHandler);
        },

        showSpacing: function(e) {
            if (e.target.closest('[data-visbug]')) return;

            const element = e.target;
            const rect = element.getBoundingClientRect();
            const computedStyle = getComputedStyle(element);

            // Create spacing overlay
            const overlay = document.createElement('div');
            overlay.setAttribute('data-visbug', 'spacing-overlay');
            overlay.style.cssText = `
                position: fixed;
                top: ${rect.top}px;
                left: ${rect.left}px;
                width: ${rect.width}px;
                height: ${rect.height}px;
                border: 1px dashed #FF8A95;
                background: rgba(120, 226, 255, 0.1);
                pointer-events: none;
                z-index: 999997;
            `;

            // Add dimension labels
            const dimensions = [
                { text: `${Math.round(rect.width)}px`, x: rect.left + rect.width / 2, y: rect.top - 20, class: 'width' },
                { text: `${Math.round(rect.height)}px`, x: rect.left - 40, y: rect.top + rect.height / 2, class: 'height' }
            ];

            dimensions.forEach(dim => {
                const label = document.createElement('div');
                label.setAttribute('data-visbug', 'spacing-label');
                label.style.cssText = `
                    position: fixed;
                    left: ${dim.x}px;
                    top: ${dim.y}px;
                    background: #1a1a1a;
                    color: white;
                    padding: 2px 6px;
                    border-radius: 3px;
                    font-family: monospace;
                    font-size: 10px;
                    z-index: 999998;
                    pointer-events: none;
                    transform: translateX(-50%) translateY(-50%);
                    white-space: nowrap;
                `;
                label.textContent = dim.text;
                document.body.appendChild(label);
            });

            // Show margins and padding
            const margin = {
                top: parseFloat(computedStyle.marginTop),
                right: parseFloat(computedStyle.marginRight),
                bottom: parseFloat(computedStyle.marginBottom),
                left: parseFloat(computedStyle.marginLeft)
            };

            const padding = {
                top: parseFloat(computedStyle.paddingTop),
                right: parseFloat(computedStyle.paddingRight),
                bottom: parseFloat(computedStyle.paddingBottom),
                left: parseFloat(computedStyle.paddingLeft)
            };

            // Add margin indicators
            if (margin.top > 0) {
                const marginTop = document.createElement('div');
                marginTop.setAttribute('data-visbug', 'spacing-margin');
                marginTop.style.cssText = `
                    position: fixed;
                    top: ${rect.top - margin.top}px;
                    left: ${rect.left}px;
                    width: ${rect.width}px;
                    height: ${margin.top}px;
                    background: rgba(255, 165, 0, 0.3);
                    border: 1px dashed orange;
                    pointer-events: none;
                    z-index: 999996;
                `;
                document.body.appendChild(marginTop);

                const marginLabel = document.createElement('div');
                marginLabel.setAttribute('data-visbug', 'spacing-label');
                marginLabel.style.cssText = `
                    position: fixed;
                    left: ${rect.left + rect.width / 2}px;
                    top: ${rect.top - margin.top / 2}px;
                    background: orange;
                    color: white;
                    padding: 1px 4px;
                    border-radius: 2px;
                    font-family: monospace;
                    font-size: 9px;
                    z-index: 999998;
                    pointer-events: none;
                    transform: translateX(-50%) translateY(-50%);
                `;
                marginLabel.textContent = `m:${Math.round(margin.top)}px`;
                document.body.appendChild(marginLabel);
            }

            // Add padding indicators
            if (padding.top > 0) {
                const paddingTop = document.createElement('div');
                paddingTop.setAttribute('data-visbug', 'spacing-padding');
                paddingTop.style.cssText = `
                    position: fixed;
                    top: ${rect.top}px;
                    left: ${rect.left}px;
                    width: ${rect.width}px;
                    height: ${padding.top}px;
                    background: rgba(0, 200, 0, 0.3);
                    border: 1px dashed green;
                    pointer-events: none;
                    z-index: 999996;
                `;
                document.body.appendChild(paddingTop);

                const paddingLabel = document.createElement('div');
                paddingLabel.setAttribute('data-visbug', 'spacing-label');
                paddingLabel.style.cssText = `
                    position: fixed;
                    left: ${rect.left + rect.width / 2}px;
                    top: ${rect.top + padding.top / 2}px;
                    background: green;
                    color: white;
                    padding: 1px 4px;
                    border-radius: 2px;
                    font-family: monospace;
                    font-size: 9px;
                    z-index: 999998;
                    pointer-events: none;
                    transform: translateX(-50%) translateY(-50%);
                `;
                paddingLabel.textContent = `p:${Math.round(padding.top)}px`;
                document.body.appendChild(paddingLabel);
            }

            document.body.appendChild(overlay);
        },

        hideSpacing: function(e) {
            document.querySelectorAll('[data-visbug="spacing-overlay"], [data-visbug="spacing-label"], [data-visbug="spacing-margin"], [data-visbug="spacing-padding"]').forEach(el => el.remove());
        },

        enableFontInspector: function() {
            document.addEventListener('click', this.inspectFont, true);
        },

        highlightElement: function(e) {
            if (e.target.closest('[data-visbug]')) return;
            e.target.style.outline = '2px solid #FF8A95';
            e.target.style.outlineOffset = '2px';
        },

        removeHighlight: function() {
            document.querySelectorAll('*:not([data-visbug])').forEach(el => {
                el.style.outline = '';
                el.style.outlineOffset = '';
            });
        },

        selectElement: function(e) {
            if (e.target.closest('[data-visbug]')) return;

            // Don't prevent navigation for links and buttons
            const target = e.target;
            const isNavigationElement = target.tagName === 'A' ||
                                      target.tagName === 'BUTTON' ||
                                      target.closest('a') ||
                                      target.closest('button') ||
                                      target.onclick ||
                                      target.getAttribute('href') ||
                                      target.getAttribute('data-link');

            if (!isNavigationElement) {
                e.preventDefault();
                e.stopPropagation();
            }

            const element = e.target;
            this.showHierarchyPanel(element);

            // Also show detailed info popup
            const computedStyle = getComputedStyle(element);
            const rect = element.getBoundingClientRect();

            // Analyze CSS property sources for dimensions
            const cssAnalysis = this.analyzeCSSProperties(element);

            const info = `${element.tagName.toLowerCase()}${element.id ? '#' + element.id : ''}${element.className ? '.' + Array.from(element.classList).join('.') : ''}

Size: ${Math.round(rect.width)}px × ${Math.round(rect.height)}px
Width: ${cssAnalysis.width}
Height: ${cssAnalysis.height}

Spacing:
${cssAnalysis.margin}
${cssAnalysis.padding}

Position: ${cssAnalysis.position}
Font: ${computedStyle.fontSize} ${computedStyle.fontFamily.split(',')[0]}`;

            window.visbug.showInfo(info.trim(), e.pageX, e.pageY);
        },

        analyzeCSSProperties: function(element) {
            const computed = getComputedStyle(element);
            const rect = element.getBoundingClientRect();

            // Helper to check if a CSS property is explicitly set
            function getEffectiveProperty(prop, computed, element) {
                const computedValue = computed[prop];

                // Check inline styles first
                if (element.style[prop] && element.style[prop] !== '') {
                    return { value: computedValue, source: 'inline style' };
                }

                // For width/height, check various controlling properties
                if (prop === 'width') {
                    if (computed.maxWidth !== 'none' && parseInt(computed.maxWidth) <= parseInt(computedValue)) {
                        return { value: computedValue, source: 'max-width: ' + computed.maxWidth };
                    }
                    if (computed.minWidth !== '0px' && parseInt(computed.minWidth) >= parseInt(computedValue)) {
                        return { value: computedValue, source: 'min-width: ' + computed.minWidth };
                    }
                    if (computed.display.includes('flex') || computed.display.includes('grid')) {
                        return { value: computedValue, source: 'flex/grid sizing' };
                    }
                    return { value: computedValue, source: 'width or auto' };
                }

                if (prop === 'height') {
                    if (computed.maxHeight !== 'none' && parseInt(computed.maxHeight) <= parseInt(computedValue)) {
                        return { value: computedValue, source: 'max-height: ' + computed.maxHeight };
                    }
                    if (computed.minHeight !== '0px' && parseInt(computed.minHeight) >= parseInt(computedValue)) {
                        return { value: computedValue, source: 'min-height: ' + computed.minHeight };
                    }
                    if (computed.height === 'auto') {
                        return { value: computedValue, source: 'content height (auto)' };
                    }
                    return { value: computedValue, source: 'height: ' + computed.height };
                }

                return { value: computedValue, source: 'computed' };
            }

            // Analyze position
            let positionInfo = computed.position;
            if (computed.position !== 'static') {
                const coords = [];
                if (computed.top !== 'auto') coords.push('top:' + computed.top);
                if (computed.right !== 'auto') coords.push('right:' + computed.right);
                if (computed.bottom !== 'auto') coords.push('bottom:' + computed.bottom);
                if (computed.left !== 'auto') coords.push('left:' + computed.left);
                if (coords.length) positionInfo += ' (' + coords.join(' ') + ')';
            }

            // Analyze margins
            let marginInfo = '';
            const margins = {
                top: computed.marginTop,
                right: computed.marginRight,
                bottom: computed.marginBottom,
                left: computed.marginLeft
            };

            const uniqueMargins = [...new Set(Object.values(margins))];
            if (uniqueMargins.length === 1) {
                marginInfo = `margin: ${uniqueMargins[0]}`;
                if (uniqueMargins[0] === '0px') {
                    marginInfo += ' (no margin)';
                }
            } else {
                marginInfo = `margin: ${margins.top} ${margins.right} ${margins.bottom} ${margins.left}`;
            }

            // Analyze padding
            let paddingInfo = '';
            const paddings = {
                top: computed.paddingTop,
                right: computed.paddingRight,
                bottom: computed.paddingBottom,
                left: computed.paddingLeft
            };

            const uniquePaddings = [...new Set(Object.values(paddings))];
            if (uniquePaddings.length === 1) {
                paddingInfo = `padding: ${uniquePaddings[0]}`;
                if (uniquePaddings[0] === '0px') {
                    paddingInfo += ' (no padding)';
                }
            } else {
                paddingInfo = `padding: ${paddings.top} ${paddings.right} ${paddings.bottom} ${paddings.left}`;
            }

            const widthAnalysis = getEffectiveProperty('width', computed, element);
            const heightAnalysis = getEffectiveProperty('height', computed, element);

            return {
                width: `${widthAnalysis.value} (${widthAnalysis.source})`,
                height: `${heightAnalysis.value} (${heightAnalysis.source})`,
                margin: marginInfo,
                padding: paddingInfo,
                position: positionInfo
            };
        },

        showHierarchyPanel: function(selectedElement) {
            // Remove existing panel
            const existingPanel = document.querySelector('[data-visbug="hierarchy-panel"]');
            if (existingPanel) existingPanel.remove();

            // Create side panel
            const panel = document.createElement('div');
            panel.setAttribute('data-visbug', 'hierarchy-panel');
            panel.style.cssText = `
                position: fixed;
                top: 80px;
                right: 20px;
                width: 280px;
                max-height: 70vh;
                background: #1a1a1a;
                border: 1px solid #333;
                border-radius: 8px;
                color: white;
                font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                z-index: 999999;
                overflow: hidden;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            `;

            // Panel header
            const header = document.createElement('div');
            header.style.cssText = `
                padding: 12px 16px;
                border-bottom: 1px solid #333;
                background: #2a2a2a;
                font-weight: 600;
                font-size: 14px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            `;
            header.innerHTML = '<span>Element Navigator</span><span style="cursor: pointer; opacity: 0.7;">✕</span>';

            // Close button
            header.querySelector('span:last-child').addEventListener('click', () => {
                panel.remove();
                document.querySelectorAll('[data-visbug="element-highlight"]').forEach(el => el.remove());
            });

            // Scrollable content area
            const content = document.createElement('div');
            content.style.cssText = `
                max-height: calc(70vh - 60px);
                overflow-y: auto;
                padding: 8px 0;
            `;

            // Build hierarchy tree
            const hierarchy = this.buildHierarchyTree(selectedElement);
            content.appendChild(hierarchy);

            panel.appendChild(header);
            panel.appendChild(content);
            document.body.appendChild(panel);
        },

        buildHierarchyTree: function(selectedElement) {
            const container = document.createElement('div');

            // Show parent element if exists
            const parent = selectedElement.parentElement;
            if (parent && parent !== document.body) {
                const parentItem = document.createElement('div');
                parentItem.style.cssText = `
                    display: flex;
                    align-items: center;
                    padding: 6px 8px;
                    font-size: 12px;
                    color: #ccc;
                    background: #1a1a1a;
                    cursor: pointer;
                    border-bottom: 1px solid #333;
                `;

                const parentTag = parent.tagName.toLowerCase();
                const parentId = parent.id ? '#' + parent.id : '';
                const parentClasses = parent.className ? '.' + Array.from(parent.classList).slice(0, 2).join('.') : '';

                parentItem.textContent = `↑ ${parentTag}${parentId}${parentClasses}`;

                parentItem.addEventListener('click', () => {
                    this.showHierarchyPanel(parent);
                    this.highlightElement({ target: parent });
                });

                parentItem.addEventListener('mouseenter', () => {
                    parentItem.style.background = '#333';
                    this.highlightElement({ target: parent });
                });

                parentItem.addEventListener('mouseleave', () => {
                    parentItem.style.background = '#1a1a1a';
                    this.removeHighlight();
                });

                container.appendChild(parentItem);
            }

            // Show siblings at the current level with indentation
            if (parent) {
                // Show all children of the parent (siblings + selected element)
                Array.from(parent.children).forEach(sibling => {
                    // Skip script, style, and visbug elements
                    if (sibling.matches && sibling.matches('script, style, [data-visbug]')) {
                        return;
                    }

                    const isSelected = sibling === selectedElement;
                    const hasChildren = sibling.children.length > 0;

                    const item = document.createElement('div');
                    item.style.cssText = `
                        display: flex;
                        align-items: center;
                        padding: 6px 12px 6px 24px;
                        cursor: pointer;
                        background: ${isSelected ? '#78E2FF' : 'transparent'};
                        color: ${isSelected ? '#1a1a1a' : '#ccc'};
                        font-size: 12px;
                        border-bottom: 1px solid #333;
                        border-left: 2px solid #444;
                        margin-left: 16px;
                    `;

                    // Child indicator
                    const indicator = document.createElement('span');
                    indicator.style.cssText = `
                        width: 12px;
                        height: 12px;
                        margin-right: 8px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 10px;
                        color: #999;
                        cursor: ${hasChildren ? 'pointer' : 'default'};
                    `;

                    if (hasChildren) {
                        const isExpanded = this.expandedSiblings.has(sibling);
                        indicator.textContent = isExpanded ? '▼' : '▶';
                    } else {
                        indicator.innerHTML = '•';
                        indicator.style.color = '#666';
                    }

                    // Element label
                    const label = document.createElement('span');
                    label.style.cssText = 'flex: 1;';

                    const tag = sibling.tagName.toLowerCase();
                    const id = sibling.id ? '#' + sibling.id : '';
                    const classes = sibling.className ? '.' + Array.from(sibling.classList).slice(0, 2).join('.') : '';
                    const childCount = hasChildren ? ` (${sibling.children.length})` : '';

                    label.textContent = `${tag}${id}${classes}${childCount}`;

                    item.appendChild(indicator);
                    item.appendChild(label);

                    // Click handler for arrow (expand/collapse)
                    if (hasChildren) {
                        indicator.addEventListener('click', (e) => {
                            e.stopPropagation();
                            if (this.expandedSiblings.has(sibling)) {
                                this.expandedSiblings.delete(sibling);
                            } else {
                                this.expandedSiblings.add(sibling);
                            }
                            // Refresh the hierarchy panel
                            this.showHierarchyPanel(selectedElement);
                        });
                    }

                    // Click handler for label (select element)
                    label.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.showHierarchyPanel(sibling);
                        this.highlightElement({ target: sibling });
                    });

                    // Hover effects
                    item.addEventListener('mouseenter', () => {
                        if (!isSelected) {
                            item.style.background = '#333';
                            this.highlightElement({ target: sibling });
                        }
                    });

                    item.addEventListener('mouseleave', () => {
                        if (!isSelected) {
                            item.style.background = 'transparent';
                            this.removeHighlight();
                        }
                    });

                    container.appendChild(item);

                    // Show children if this sibling is expanded
                    if (hasChildren && this.expandedSiblings.has(sibling)) {
                        Array.from(sibling.children).forEach(child => {
                            // Skip script, style, and visbug elements
                            if (child.matches && child.matches('script, style, [data-visbug]')) {
                                return;
                            }

                            const childItem = document.createElement('div');
                            childItem.style.cssText = `
                                display: flex;
                                align-items: center;
                                padding: 4px 12px 4px 48px;
                                cursor: pointer;
                                background: transparent;
                                color: #ccc;
                                font-size: 12px;
                                border-bottom: 1px solid #2a2a2a;
                            `;

                            const childIndicator = document.createElement('span');
                            childIndicator.style.cssText = `
                                width: 8px;
                                height: 8px;
                                margin-right: 8px;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                font-size: 8px;
                                color: #666;
                            `;
                            childIndicator.innerHTML = '◦';

                            const childLabel = document.createElement('span');
                            childLabel.style.cssText = 'flex: 1;';

                            const childTag = child.tagName.toLowerCase();
                            const childId = child.id ? '#' + child.id : '';
                            const childClasses = child.className ? '.' + Array.from(child.classList).slice(0, 1).join('.') : '';

                            childLabel.textContent = `${childTag}${childId}${childClasses}`;

                            childItem.appendChild(childIndicator);
                            childItem.appendChild(childLabel);

                            // Click handler for child
                            childItem.addEventListener('click', (e) => {
                                e.stopPropagation();
                                this.showHierarchyPanel(child);
                                this.highlightElement({ target: child });
                            });

                            // Hover effects for child
                            childItem.addEventListener('mouseenter', () => {
                                childItem.style.background = '#2a2a2a';
                                this.highlightElement({ target: child });
                            });

                            childItem.addEventListener('mouseleave', () => {
                                childItem.style.background = 'transparent';
                                this.removeHighlight();
                            });

                            container.appendChild(childItem);
                        });
                    }
                });
            }

            return container;
        },

        pickColor: function(e) {
            if (e.target.closest('[data-visbug]')) return;
            e.preventDefault();
            e.stopPropagation();

            const color = getComputedStyle(e.target).color;
            navigator.clipboard?.writeText(color);
            window.visbug.showInfo(`Copied: ${color}`, e.pageX, e.pageY);
        },

        inspectFont: function(e) {
            if (e.target.closest('[data-visbug]')) return;
            e.preventDefault();
            e.stopPropagation();

            const style = getComputedStyle(e.target);
            const fontInfo = `${style.fontFamily} ${style.fontSize} ${style.fontWeight}`;
            window.visbug.showInfo(fontInfo, e.pageX, e.pageY);
        },

        showInfo: function(text, x, y) {
            const info = document.createElement('div');
            info.setAttribute('data-visbug', 'info');
            info.style.cssText = `
                position: absolute;
                left: ${x}px;
                top: ${y - 40}px;
                background: #1a1a1a;
                color: white;
                padding: 8px 12px;
                border-radius: 4px;
                font-family: monospace;
                font-size: 11px;
                z-index: 999997;
                white-space: pre-line;
                border: 1px solid #333;
            `;
            info.textContent = text;

            document.querySelectorAll('[data-visbug="info"]').forEach(el => el.remove());
            document.body.appendChild(info);
            setTimeout(() => { if (info.parentNode) info.remove(); }, 3000);
        },

        deactivate: function() {
            this.clearEffects();
            document.querySelectorAll('[data-visbug]').forEach(el => el.remove());
            delete window.visbug;
        }
    };

    // Auto-activate VisBug when loaded
    console.log('VisBug loaded successfully');
    window.visbug.activate();
})();
