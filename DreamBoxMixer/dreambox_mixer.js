let addDreamBoxMixer = null;

(function() {
    // *****************************
    // Variables
    // *****************************

    // Image variables
    let images = {
        dreamboxBin: new Image(),
        dreamboxCup: new Image(),
        dreamboxDivider: new Image(),
        dreamboxJar: new Image(),
        dreamboxLayout: new Image(),
        dreamboxTote: new Image()
    };
    let imagesToLoad = Object.keys(images).length;
    let imagesLoaded = 0;

    // Item variables
    let itemDefs = {
        binItem: {
            img: images.dreamboxBin,
            x: 0,
            y: 0,
            width: 71,
            height: 22
        },
        cupItem: {
            img: images.dreamboxCup,
            x: 0,
            y: 0,
            width: 18,
            height: 22
        },
        dividerItem: {
            img: images.dreamboxDivider,
            x: 0,
            y: 0,
            width: 93,
            height: 6
        },
        jarItem: {
            img: images.dreamboxJar,
            x: 0,
            y: 0,
            width: 22,
            height: 21
        },
        toteItem: {
            img: images.dreamboxTote,
            x: 0,
            y: 0,
            width: 35,
            height: 28
        }
    };

    // General variables
    let instances = [];
    let instanceDefinition = {
        ctx: null,
        itemsToDraw: [],
        selectedItem: null,
        dragging: false,
        lastDraggedX: 0,
        lastDraggedY: 0
    };

    // *****************************
    // Functions
    // *****************************
    CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
        if (w < 2 * r) r = w / 2;
        if (h < 2 * r) r = h / 2;
        this.beginPath();
        this.moveTo(x+r, y);
        this.arcTo(x+w, y,   x+w, y+h, r);
        this.arcTo(x+w, y+h, x,   y+h, r);
        this.arcTo(x,   y+h, x,   y,   r);
        this.arcTo(x,   y,   x+w, y,   r);
        this.closePath();
        return this;
    }

    let draw = function(instance) {
        if (imagesLoaded != imagesToLoad)
            return;
        
        let ctx = instance.ctx;
        
        // Clear the canvas
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        // Draw the selected item
        if (instance.selectedItem != null) {
            let dArr = [-1,-1, 0,-1, 1,-1, -1,0, 1,0, -1,1, 0,1, 1,1]; // offset array
            let s = 2; // thickness scale
            
            // draw images at offsets from the array scaled by s
            for(let i = 0; i < dArr.length; i += 2) {
                ctx.drawImage(instance.selectedItem.img, instance.selectedItem.x + dArr[i]*s, instance.selectedItem.y + dArr[i+1]*s);
            }
            
            // fill with color
            ctx.globalCompositeOperation = "source-in";
            ctx.fillStyle = "red";
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            
            // draw original image in normal mode
            ctx.globalCompositeOperation = "source-over";

            // Draw the image
            ctx.drawImage(instance.selectedItem.img, instance.selectedItem.x, instance.selectedItem.y);
        }

        ctx.globalCompositeOperation = "destination-over";

        // Draw all the items
        for (let i = 0; i < instance.itemsToDraw.length; i++) {
            let item = instance.itemsToDraw[i];
            ctx.drawImage(item.img, item.x, item.y);
        }

        // Draw the dragout menu
        ctx.fillStyle = "#4787ed";
        let padding = 4;
        let startX = 38;
        let startY = 1;
        for (const property in itemDefs) {
            let itemDef = itemDefs[property];

            ctx.drawImage(itemDef.img, startX + padding / 2, startY + (28 + padding) / 2 - itemDef.height / 2);
            ctx.roundRect(startX, startY, itemDef.width + padding, 28 + padding, 3);
            ctx.stroke();
            ctx.fill();

            startX += itemDef.width + padding;
        }

        // Draw the background
        ctx.drawImage(images.dreamboxLayout, 0, padding);
    };

    let drawAll = function() {
        for(let i = 0; i < instances.length; i++) {
            draw(instances[i]);
        }
    };

    let listenForMouse = function(instance) {
        instance.ctx.canvas.addEventListener('mousedown', e => {
            let x = e.offsetX * instance.ctx.canvas.width / instance.ctx.canvas.offsetWidth;
            let y = e.offsetY * instance.ctx.canvas.height / instance.ctx.canvas.offsetHeight;
            
            // Select / start dragging something
            let itemUnder = false;
            for (let i = 0; i < instance.itemsToDraw.length; i++) {
                let item = instance.itemsToDraw[i];
                if (x > item.x && x < item.x + item.width && y > item.y && y < item.y + item.height) {
                    instance.selectedItem = item;

                    instance.dragging = true;
                    instance.lastDraggedX = x;
                    instance.lastDraggedY = y;

                    itemUnder = true;

                    break;
                }
            }
            if (itemUnder == false) {
                instance.selectedItem = null;

                let padding = 4;
                let startX = 38;
                let startY = 1;
                for (const property in itemDefs) {
                    let itemDef = itemDefs[property];

                    if (x > startX && x < startX + itemDef.width + padding && y > startY && y < 28 + padding) {
                        let item = Object.assign({}, itemDef);
                        item.x = x - item.width / 2;
                        item.y = y - item.height / 2;

                        instance.itemsToDraw.push(item);
                        instance.selectedItem = item;

                        instance.dragging = true;
                        instance.lastDraggedX = x;
                        instance.lastDraggedY = y;

                        break;
                    }

                    startX += itemDef.width + padding;
                }
            }
            
            draw(instance);
        });

        instance.ctx.canvas.addEventListener('mousemove', e => {
            if (instance.dragging == true) {
                let x = e.offsetX * instance.ctx.canvas.width / instance.ctx.canvas.offsetWidth;
                let y = e.offsetY * instance.ctx.canvas.height / instance.ctx.canvas.offsetHeight;

                instance.selectedItem.x += x - instance.lastDraggedX;
                instance.selectedItem.y += y - instance.lastDraggedY;

                instance.lastDraggedX = x;
                instance.lastDraggedY = y;

                draw(instance);
            }
        });

        instance.ctx.canvas.addEventListener('mouseup', e => {
            instance.dragging = false;
        });
    };

    addDreamBoxMixer = function(canvas) {
        canvas.width  = 762;
        canvas.height = 507;

        let ctx = canvas.getContext('2d');
        if (ctx != null) {
            let instance = Object.assign({}, instanceDefinition);
            instance.ctx = ctx;
            instances.push(instance);

            listenForMouse(instance);

            return instance;
        }

        return null;
    };

    // *****************************
    // Images
    // *****************************
    images.dreamboxBin.src =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEcAAAAWCAYAAACSYoFNAAABhGlDQ1BJQ0MgcHJvZmlsZQAAKJF9kT1Iw0AcxV9TRZEWByuKKGSoThZERRylikWwUNoKrTqYXPoFTRqSFBdHwbXg4Mdi1cHFWVcHV0EQ/ABxc3NSdJES\
        /5cUWsR4cNyPd/ced+8AoV5mqtkxAaiaZSRjUTGTXRW7XiGgHwMIYkRiph5PLabhOb7u4ePrXYRneZ/7cwSVnMkAn0g8x3TDIt4gntm0dM77xCFWlBTic+Jxgy5I/Mh12eU3zgWHBZ4ZMtLJeeIQsVhoY7mNWdFQiaeJw4qqUb6QcVnhvMVZLVdZ857\
        8hYGctpLiOs1hxLCEOBIQIaOKEsqwEKFVI8VEkvajHv4hx58gl0yuEhg5FlCBCsnxg//B727N/NSkmxSIAp0vtv0xCnTtAo2abX8f23bjBPA/A1day1+pA7OfpNdaWvgI6N0GLq5bmrwHXO4Ag0+6ZEiO5Kcp5PPA+xl9UxbouwV61tzemvs4fQDS1N\
        XyDXBwCIwVKHvd493d7b39e6bZ3w9os3Kjmp2EMQAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAAuIwAALiMBeKU/dgAAAAd0SU1FB+UCFRcZDWuCtAwAAAAZdEVYdENvbW1lbnQAQ3JlYXRlZCB3aXRoIEdJTVBXgQ4XAAACDklEQVRYw+2YPYsaU\
        RSGn/nwjlOMKWyzIOiK4BiQ2XQiAWOwskiRJk22SbmQysJfoV1+hbCbbtNlGwM2oqwRhE2VxSILE3F03HhTyCZIUs4NiL4/4JxzH+4577lXYyONg/6SCdDr9V56nnd9gATAejAYZF3X/WACeJ736M3p6dASAk3bXz5SSpZhiOu6rwChATSbTfn97o4X\
        1SqWZe0tnNVqxfnFBdnjYxqNhmMCrKUknU5TqVSwbTuSRGEYEoah8gNZlkUsFous5n6/j5Tyz8zRAF3XMU0T0zQjSdTtdvl0dcXP+3s1LQAYuk6tVqNQKERS93q9Rtf17YEsFRQ/GA75MhpRLpeJx+ORxw8WCz5eXpLJZMjn8+rcSoWCICCZTFKtVnE\
        cJ/L4vu/zudtlsVyqtXJFo5+YEDiOQyKRUJIiJgRIuXtwpJTM53Om0ynz+Tzy+D9mM4IgUL8EqththBCMRiPa7XZkbrLlLKsVk8mE55WKWjhSwdUslUo4jrMBr2KxlJKnJycUi0UMw9ittsrlcqRSKSXgH6RpGrZtb9nvTsCxLAshhPIlUOVzx9zVwv\
        +HdA46wDnAUWXlvu/z7fYWW8E7aJe+LGaz2e+NfjMxDePtu7Oz94+PjjD0/b1Mayn5enNDq9V6DXRMgPNOp1+v158gBISh3Fs6QmiEIePx+Fk2m10+eO3h7/gf+gXeT6sqiutPowAAAABJRU5ErkJggg==';
    images.dreamboxBin.onload = function() {
        imagesLoaded += 1;
        drawAll();
    };
    images.dreamboxCup.src =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAWCAYAAADNX8xBAAABhGlDQ1BJQ0MgcHJvZmlsZQAAKJF9kT1Iw0AcxV9TRZEWByuKKGSoThZERRylikWwUNoKrTqYXPoFTRqSFBdHwbXg4Mdi1cHFWVcHV0EQ/ABxc3NSdJES\
        /5cUWsR4cNyPd/ced+8AoV5mqtkxAaiaZSRjUTGTXRW7XiGgHwMIYkRiph5PLabhOb7u4ePrXYRneZ/7cwSVnMkAn0g8x3TDIt4gntm0dM77xCFWlBTic+Jxgy5I/Mh12eU3zgWHBZ4ZMtLJeeIQsVhoY7mNWdFQiaeJw4qqUb6QcVnhvMVZLVdZ857\
        8hYGctpLiOs1hxLCEOBIQIaOKEsqwEKFVI8VEkvajHv4hx58gl0yuEhg5FlCBCsnxg//B727N/NSkmxSIAp0vtv0xCnTtAo2abX8f23bjBPA/A1day1+pA7OfpNdaWvgI6N0GLq5bmrwHXO4Ag0+6ZEiO5Kcp5PPA+xl9UxbouwV61tzemvs4fQDS1N\
        XyDXBwCIwVKHvd493d7b39e6bZ3w9os3Kjmp2EMQAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAAuIwAALiMBeKU/dgAAAAd0SU1FB+UCFRcRMPszchUAAAAZdEVYdENvbW1lbnQAQ3JlYXRlZCB3aXRoIEdJTVBXgQ4XAAAB30lEQVQ4y53VvY7TQ\
        BDA8f86jk4gJaLg6pO4tHkBHoKKjnc5Ou4NqLgHOAqQeII0FFRIJA0nFCElwfHH2sGHN/HZnqXA1kUnjtiMtM0WP83u7MwqwAH6gOL/wgKFCzym13tKVfXrzS6hcN2UsvzoAsdY+/zV+fmLwWDQSYnjmJdnZ6+BLy5wg7WPxuMxo9PTTtDXqyuAY6Dv\
        AhqlzHA4ZDQa4ThOp4yAAihdwABZHMcopTpBURSB4xhEjANUQBJrjbXd7nrt+wAJkDuAIPIjCEOKomiNiAhBEAAEgDh1yb97nkee562h3W5HFIYgsmogATytdScoyzK01gDLBgLYpGlqdnne+p6yLONnmhpA18kAcIJS72azma2qyh4KEbHT6dSi1Hv\
        ghLrPAK5R6td6vW6dkdYalMqA3T6UAfFqtUJEDneptSwWC4DwLnQDRH4QtIaWyyWI+Hchi8g6qKE2x/ODAHq9qH7Q7PfDcrPZYIw5iFRVRZIkUFVhU7F9aPXm4uJSa01ZlhRFce9KkoTtdtu8agDcPSjE2geTyYT5fA7q/oHpeR5vLy8/AH4zDPeha6\
        z9FGn9zBjzT8gYA47zGZHodlTeRo+joyfk+cNWI/ZPtb4BJX8Z+E7HT0Cao/0G+dlG1jslc4QAAAAASUVORK5CYII=';
    images.dreamboxCup.onload = function() {
        imagesLoaded += 1;
        drawAll();
    };
    images.dreamboxDivider.src =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAF0AAAAGCAYAAAChOJL3AAABhGlDQ1BJQ0MgcHJvZmlsZQAAKJF9kT1Iw0AcxV9TRZEWByuKKGSoThZERRylikWwUNoKrTqYXPoFTRqSFBdHwbXg4Mdi1cHFWVcHV0EQ/ABxc3NSdJES\
        /5cUWsR4cNyPd/ced+8AoV5mqtkxAaiaZSRjUTGTXRW7XiGgHwMIYkRiph5PLabhOb7u4ePrXYRneZ/7cwSVnMkAn0g8x3TDIt4gntm0dM77xCFWlBTic+Jxgy5I/Mh12eU3zgWHBZ4ZMtLJeeIQsVhoY7mNWdFQiaeJw4qqUb6QcVnhvMVZLVdZ857\
        8hYGctpLiOs1hxLCEOBIQIaOKEsqwEKFVI8VEkvajHv4hx58gl0yuEhg5FlCBCsnxg//B727N/NSkmxSIAp0vtv0xCnTtAo2abX8f23bjBPA/A1day1+pA7OfpNdaWvgI6N0GLq5bmrwHXO4Ag0+6ZEiO5Kcp5PPA+xl9UxbouwV61tzemvs4fQDS1N\
        XyDXBwCIwVKHvd493d7b39e6bZ3w9os3Kjmp2EMQAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAAuIwAALiMBeKU/dgAAAAd0SU1FB+UCFRcWOyOgPVoAAAAZdEVYdENvbW1lbnQAQ3JlYXRlZCB3aXRoIEdJTVBXgQ4XAAAAeElEQVRIx+3UIRLDI\
        BBG4bfTNK4+mjtUlDvApeo4DkcKMgJUTYYhhmR6AaL2Mztrn/hB3U76fQIL8NAkQ/2AberP4pxbSymaZZDWGtZaQgjzGX1OKZFzRkS00AC1VowxAFfhF/DuM6MGiTF+vPdf+dt2DX7DygD7AbPOGu3a679qAAAAAElFTkSuQmCC';
    images.dreamboxDivider.onload = function() {
        imagesLoaded += 1;
        drawAll();
    };
    images.dreamboxJar.src =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAVCAYAAABCIB6VAAABhGlDQ1BJQ0MgcHJvZmlsZQAAKJF9kT1Iw0AcxV9TRZEWByuKKGSoThZERRylikWwUNoKrTqYXPoFTRqSFBdHwbXg4Mdi1cHFWVcHV0EQ/ABxc3NSdJES\
        /5cUWsR4cNyPd/ced+8AoV5mqtkxAaiaZSRjUTGTXRW7XiGgHwMIYkRiph5PLabhOb7u4ePrXYRneZ/7cwSVnMkAn0g8x3TDIt4gntm0dM77xCFWlBTic+Jxgy5I/Mh12eU3zgWHBZ4ZMtLJeeIQsVhoY7mNWdFQiaeJw4qqUb6QcVnhvMVZLVdZ857\
        8hYGctpLiOs1hxLCEOBIQIaOKEsqwEKFVI8VEkvajHv4hx58gl0yuEhg5FlCBCsnxg//B727N/NSkmxSIAp0vtv0xCnTtAo2abX8f23bjBPA/A1day1+pA7OfpNdaWvgI6N0GLq5bmrwHXO4Ag0+6ZEiO5Kcp5PPA+xl9UxbouwV61tzemvs4fQDS1N\
        XyDXBwCIwVKHvd493d7b39e6bZ3w9os3Kjmp2EMQAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAAuIwAALiMBeKU/dgAAAAd0SU1FB+UCFRcUIez0pqIAAAAZdEVYdENvbW1lbnQAQ3JlYXRlZCB3aXRoIEdJTVBXgQ4XAAABTklEQVQ4y+3Vr27CU\
        BSA8e+2DV1C+icT4xFIECQLBswegmAweBRvgETxBCgUCQliDoFqg8IsYHmAQrJkbAFxW9Y7A6yZghKm+MzJNT9xxTmC3wRgHGbaIkBxgI49djqd90KhkEpcLBa02+1H4OMvbOq6TqlUSgXP53MA8/hOwnvP8/B9PxW83+8BwuS/AjjNZnOz3W4pl8tk\
        MpmL0DAMmU6nWJZFr9dzgU8BiG63G0spqdVq5HI5NE27CI7jmNVqxXA4xHVdWq2WANDq9bryPE9d22QyUY1GQwFoAFJKLMvi2rLZLFJKTvAtusN3+J9hZds2QRBcjQVBgOM4p+2m+v3+y3q99ne7HcViEdM0UUohhDhrRlHEbDZjMBgwHo8rye32ADy\
        PRqPX5XL5dFiBZ2cYBvl8nmq1WgHeAJk8QzpgA26K86SADfAFfHPLfgD0csGo+iBl1QAAAABJRU5ErkJggg==';
    images.dreamboxJar.onload = function() {
        imagesLoaded += 1;
        drawAll();
    };
    images.dreamboxLayout.src =
        'data:image/png;base64,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';
    images.dreamboxLayout.onload = function() {
        imagesLoaded += 1;
        drawAll();
    };
    images.dreamboxTote.src =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACIAAAAcCAYAAAAEN20fAAABhGlDQ1BJQ0MgcHJvZmlsZQAAKJF9kT1Iw0AcxV9TpSIVQTuIVMhQnSyIijhKFYtgobQVWnUwufQLmjQkKS6OgmvBwY/FqoOLs64OroIg+AHi5uak6CIl\
        /i8ptIjx4Lgf7+497t4BQqPCVLNrAlA1y0jFY2I2tyoGXiEgjAGMICgxU0+kFzPwHF/38PH1LsqzvM/9OfqUvMkAn0g8x3TDIt4gntm0dM77xCFWkhTic+Jxgy5I/Mh12eU3zkWHBZ4ZMjKpeeIQsVjsYLmDWclQiaeJI4qqUb6QdVnhvMVZrdRY657\
        8hcG8tpLmOs0w4lhCAkmIkFFDGRVYiNKqkWIiRfsxD/+w40+SSyZXGYwcC6hCheT4wf/gd7dmYWrSTQrGgO4X2/4YBQK7QLNu29/Htt08AfzPwJXW9lcbwOwn6fW2FjkC+reBi+u2Ju8BlzvA0JMuGZIj+WkKhQLwfkbflAMGb4HeNbe31j5OH4AMdb\
        V8AxwcAmNFyl73eHdPZ2//nmn19wNrZnKkioRuvwAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAAuIwAALiMBeKU/dgAAAAd0SU1FB+UCHBIlGA5vpHkAAAAZdEVYdENvbW1lbnQAQ3JlYXRlZCB3aXRoIEdJTVBXgQ4XAAACr0lEQVRIx82Xv0/bQ\
        BTHP7ZTERiISNIRUYa0iIERVar6H+QPQf0XCEP/DLqwsXQpFUVIVJVoqCp1BamlDCxBIjhN7fhnzr5zB2KUEEsVVDF9kiX7zs/38fe9e3enARpQGFwPYQkQFYBHwEtg9YFAbOB9ATCAF/V6/XW9XkfTtNwITNOksbHxmST5AqADrxqNRiKlTPK0s7Oz\
        BF1/CzwpAArDiGzbzqR2XZcfp6ckSXLvPy+VSjyt1cbagyCAJNGYno7TBLVjKTMHOz45YW1tjeXlZYpTU3eGaF1c8LhaZXt7e6yv3+9DkvgEQXQNImXf87zslE4SVlZWaKyvUy6X7wyyv7/P4eFhZl8YhumtTBVx4ihCKYVhGGMOxWKRSqVCtVq9V1h\
        0XR9rV0rh+T7ouodSUfpGoJSi1+vlNmPiOMa8ugJwRhTRNA3f96lUKmNO7XabZrNJqVS684DHx8dEUZQZ8kE6/B4G8WzbPrcsa3F+fn7EoTw3x+zsLLu7u2gZEv/NhBAsLS1lKnJlmqBUN62sAK7nee0wDBdvO9RqNd5sbv7T9M3KO6UUvu+DYfSQ8k\
        YRddhs/rRs+3nWR2ZmZiaSI7Ztg5QukKRax4Dd7/dzS1alFFJKKBT8tLwDKJQKbcvKDSSKIizLgjh2hkEk4Hmed02Zgwkh0voS3AYxO50OQohcQCzLwnGcc6A3GhpwXNfNTZEgCPiwt/cV8G8r0ul2u7kpMljtFWCNKRKGIUqp3BQZjBsNgwD4sZS5K\
        eK4LoCbPg+DiJu5nYOFYQhKiSwQXwiRuUBNwgYLnpMFErUvL7/lsRUQQhD4/khohs8y/tHR0fdWq7W6sLAwcTV+dbtgGCaDVBgGiQCxtbXFu52diYJIKfl4cPAJKc20bfgQowPPgEpemzTgdLAx+n/sD9e86mKGcwioAAAAAElFTkSuQmCC';
    images.dreamboxTote.onload = function() {
        imagesLoaded += 1;
        drawAll();
    };
})();