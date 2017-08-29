module PhaserSpine {
    export module Canvas {
        export class Renderer {
            private static QUAD_TRIANGLES: number[] = [0, 1, 2, 2, 3, 0];

            private static VERTEX_SIZE: number = 2 + 2 + 4;

            private game: Phaser.Game;

            private vertices = spine.Utils.newFloatArray(8 * 1024);

            private tempColor = new spine.Color();

            constructor (game: Phaser.Game) {
                this.game = game;
            }

            public destroy(): void {
                this.game = null;
                this.vertices = null;
                this.tempColor = null;
            }

            public resize(phaserSpine: Spine,  renderSession: IRenderSession): void {
                // let res = renderSession.resolution;
                // let scale = phaserSpine.scale;
                let bounds = phaserSpine.getBounds();

                // magic
                var centerX = phaserSpine.offset.x + phaserSpine.size.x / 2;
                var centerY = phaserSpine.offset.y + phaserSpine.size.y / 2;
                var scaleX = phaserSpine.size.x / this.game.width;
                var scaleY = phaserSpine.size.y / this.game.height;
                var scale = 1;
                if (scale < 1) scale = 1;
                var width = this.game.width * scale;
                var height = this.game.height * scale;
                renderSession.context.setTransform(1, 0, 0, 1, 0, 0);
                renderSession.context.scale(1 / scale, 1 / scale);

                //Offset to spine's rootbone position
                renderSession.context.translate(-centerX, -centerY);

                //Offset to Phaser's position
                renderSession.context.translate(bounds.x, bounds.y);

                //Calculate the x/y positions
                //
                // renderSession.context.setTransform(1, 0, 0, 1, 0, 0);;
                // //Scale the animation
                // renderSession.context.scale(scale.x * res, scale.y * res);
                // //Offset to model's center
                // renderSession.context.translate(
                //     phaserSpine.offset.x + phaserSpine.size.x / 2,
                //     phaserSpine.offset.y + phaserSpine.size.y / 2
                // );
                // // if(res > 1){
                // //     renderSession.context.translate(0, bounds.height / scale.y / res / 2);
                // // }
                // //Offset to center of screen
                // renderSession.context.translate(this.game.width / 2, this.game.height / 2);
            }

            public drawImages (phaserSpine: Spine, renderSession: IRenderSession) {
                let ctx = renderSession.context;
                let drawOrder = phaserSpine.skeleton.drawOrder;

                let res = renderSession.resolution;

                if (SpinePlugin.DEBUG) ctx.strokeStyle = "green";

                ctx.save();
                for (let i = 0, n = drawOrder.length; i < n; i++) {
                    let slot = drawOrder[i];
                    let attachment = slot.getAttachment();
                    let regionAttachment: spine.RegionAttachment = null;
                    let region: spine.TextureAtlasRegion = null;
                    let image: HTMLImageElement = null;

                    if (attachment instanceof spine.RegionAttachment) {
                        regionAttachment = <spine.RegionAttachment>attachment;
                        region = <spine.TextureAtlasRegion>regionAttachment.region;
                        image = (<Canvas.Texture>region.texture).getImage();
                    } else continue;

                    let skeleton = slot.bone.skeleton;
                    let skeletonColor = skeleton.color;
                    let slotColor = slot.color;
                    let regionColor = regionAttachment.color;
                    let alpha = skeletonColor.a * slotColor.a * regionColor.a;
                    let color = this.tempColor;
                    color.set(skeletonColor.r * slotColor.r * regionColor.r,
                        skeletonColor.g * slotColor.g * regionColor.g,
                        skeletonColor.b * slotColor.b * regionColor.b,
                        alpha);

                    let att = <spine.RegionAttachment>attachment;
                    let bone = slot.bone;
                    let w = region.width;
                    let h = region.height;
                    ctx.save();
                    ctx.transform(bone.a, bone.c, bone.b, bone.d, bone.worldX, bone.worldY);
                    ctx.translate(attachment.offset[0], attachment.offset[1]);
                    ctx.rotate(attachment.rotation * Math.PI / 180);
                    let atlasScale = att.width / w;
                    ctx.scale(atlasScale * attachment.scaleX, atlasScale * attachment.scaleY);
                    ctx.translate(w / 2, h / 2);
                    if (attachment.region.rotate) {
                        let t = w;
                        w = h;
                        h = t;
                        ctx.rotate(-Math.PI / 2);
                    }
                    ctx.scale(1, -1);
                    ctx.translate(-w / 2 / res, -h / 2 / res);
                    if (color.r != 1 || color.g != 1 || color.b != 1 || color.a != 1) {
                        ctx.globalAlpha = color.a;
                        // experimental tinting via compositing, doesn't work
                        // ctx.globalCompositeOperation = "source-atop";
                        // ctx.fillStyle = "rgba(" + (color.r * 255 | 0) + ", " + (color.g * 255 | 0)  + ", " + (color.b * 255 | 0) + ", " + color.a + ")";
                        // ctx.fillRect(0, 0, w, h);
                    }
                    ctx.drawImage(image, region.x, region.y, w, h, 0, 0, w / res, h / res);
                    if (SpinePlugin.DEBUG) ctx.strokeRect(0, 0, w / res, h / res);
                    ctx.restore();
                }

                ctx.restore();
            }

            public drawTriangles (phaserSpine: Spine, renderSession: IRenderSession) {
                let blendMode: spine.BlendMode = null;

                let vertices: ArrayLike<number> = null;
                let triangles: Array<number> = null;
                let drawOrder = phaserSpine.skeleton.drawOrder;

                let res = renderSession.resolution;

                for (let i = 0, n = drawOrder.length; i < n; i++) {
                    let slot = drawOrder[i];
                    let attachment = slot.getAttachment();
                    let texture: HTMLImageElement = null;
                    let region: spine.TextureAtlasRegion = null;
                    if (attachment instanceof spine.RegionAttachment) {
                        let regionAttachment = <spine.RegionAttachment>attachment;
                        vertices = this.computeRegionVertices(slot, regionAttachment, false);
                        triangles = Renderer.QUAD_TRIANGLES;
                        region = <spine.TextureAtlasRegion>regionAttachment.region;
                        texture = (<Canvas.Texture>region.texture).getImage();

                    } else if (attachment instanceof spine.MeshAttachment) {
                        let mesh = <spine.MeshAttachment>attachment;
                        vertices = this.computeMeshVertices(slot, mesh, false);
                        triangles = mesh.triangles;
                        texture = (<spine.TextureAtlasRegion>mesh.region.renderObject).texture.getImage();
                    } else continue;

                    if (texture != null) {
                        let slotBlendMode = slot.data.blendMode;
                        if (slotBlendMode != blendMode) {
                            blendMode = slotBlendMode;
                        }

                        let ctx = renderSession.context;

                        for (var j = 0; j < triangles.length; j+=3) {
                            let t1 = triangles[j] * 8, t2 = triangles[j+1] * 8, t3 = triangles[j+2] * 8;

                            let x0 = vertices[t1], y0 = vertices[t1 + 1], u0 = vertices[t1 + 6], v0 = vertices[t1 + 7];
                            let x1 = vertices[t2], y1 = vertices[t2 + 1], u1 = vertices[t2 + 6], v1 = vertices[t2 + 7];
                            let x2 = vertices[t3], y2 = vertices[t3 + 1], u2 = vertices[t3 + 6], v2 = vertices[t3 + 7];

                            this.drawTriangle(renderSession, texture, x0 / res, y0 / res, u0, v0, x1 / res, y1 / res, u1, v1, x2 / res, y2 / res, u2, v2);

                            if (SpinePlugin.DEBUG) {
                                ctx.strokeStyle = "green";
                                ctx.beginPath();
                                ctx.moveTo(x0 / res, y0 / res);
                                ctx.lineTo(x1 / res, y1 / res);
                                ctx.lineTo(x2 / res, y2 / res);
                                ctx.lineTo(x0 / res, y0 / res);
                                ctx.stroke();
                            }
                        }
                    }
                }
            }

            // Adapted from http://extremelysatisfactorytotalitarianism.com/blog/?p=2120
            // Apache 2 licensed
            private drawTriangle(renderSession: PIXI.RenderSession, img: HTMLImageElement, x0: number, y0: number, u0: number, v0: number,
                                 x1: number, y1: number, u1: number, v1: number,
                                 x2: number, y2: number, u2: number, v2: number) {
                let ctx = renderSession.context;

                u0 *= img.width;
                v0 *= img.height;
                u1 *= img.width;
                v1 *= img.height;
                u2 *= img.width;
                v2 *= img.height;

                ctx.beginPath();
                ctx.moveTo(x0, y0);
                ctx.lineTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.closePath();

                x1 -= x0;
                y1 -= y0;
                x2 -= x0;
                y2 -= y0;

                u1 -= u0;
                v1 -= v0;
                u2 -= u0;
                v2 -= v0;

                var det = 1 / (u1*v2 - u2*v1),

                    // linear transformation
                    a = (v2*x1 - v1*x2) * det,
                    b = (v2*y1 - v1*y2) * det,
                    c = (u1*x2 - u2*x1) * det,
                    d = (u1*y2 - u2*y1) * det,

                    // translation
                    e = x0 - a*u0 - c*v0,
                    f = y0 - b*u0 - d*v0;

                ctx.save();
                ctx.transform(a, b, c, d, e, f);
                ctx.clip();
                ctx.drawImage(img, 0, 0);
                ctx.restore();
            }

            private computeRegionVertices(slot: spine.Slot, region: spine.RegionAttachment, pma: boolean) {
                let skeleton = slot.bone.skeleton;
                let skeletonColor = skeleton.color;
                let slotColor = slot.color;
                let regionColor = region.color;
                let alpha = skeletonColor.a * slotColor.a * regionColor.a;
                let multiplier = pma ? alpha : 1;
                let color = this.tempColor;
                color.set(skeletonColor.r * slotColor.r * regionColor.r * multiplier,
                    skeletonColor.g * slotColor.g * regionColor.g * multiplier,
                    skeletonColor.b * slotColor.b * regionColor.b * multiplier,
                    alpha);

                region.computeWorldVertices(slot.bone, this.vertices, 0, Renderer.VERTEX_SIZE);

                let vertices = this.vertices;
                let uvs = region.uvs;

                vertices[spine.RegionAttachment.C1R] = color.r;
                vertices[spine.RegionAttachment.C1G] = color.g;
                vertices[spine.RegionAttachment.C1B] = color.b;
                vertices[spine.RegionAttachment.C1A] = color.a;
                vertices[spine.RegionAttachment.U1] = uvs[0];
                vertices[spine.RegionAttachment.V1] = uvs[1];

                vertices[spine.RegionAttachment.C2R] = color.r;
                vertices[spine.RegionAttachment.C2G] = color.g;
                vertices[spine.RegionAttachment.C2B] = color.b;
                vertices[spine.RegionAttachment.C2A] = color.a;
                vertices[spine.RegionAttachment.U2] = uvs[2];
                vertices[spine.RegionAttachment.V2] = uvs[3];

                vertices[spine.RegionAttachment.C3R] = color.r;
                vertices[spine.RegionAttachment.C3G] = color.g;
                vertices[spine.RegionAttachment.C3B] = color.b;
                vertices[spine.RegionAttachment.C3A] = color.a;
                vertices[spine.RegionAttachment.U3] = uvs[4];
                vertices[spine.RegionAttachment.V3] = uvs[5];

                vertices[spine.RegionAttachment.C4R] = color.r;
                vertices[spine.RegionAttachment.C4G] = color.g;
                vertices[spine.RegionAttachment.C4B] = color.b;
                vertices[spine.RegionAttachment.C4A] = color.a;
                vertices[spine.RegionAttachment.U4] = uvs[6];
                vertices[spine.RegionAttachment.V4] = uvs[7];

                return vertices;
            }

            private computeMeshVertices(slot: spine.Slot, mesh: spine.MeshAttachment, pma: boolean) {
                let skeleton = slot.bone.skeleton;
                let skeletonColor = skeleton.color;
                let slotColor = slot.color;
                let regionColor = mesh.color;
                let alpha = skeletonColor.a * slotColor.a * regionColor.a;
                let multiplier = pma ? alpha : 1;
                let color = this.tempColor;
                color.set(skeletonColor.r * slotColor.r * regionColor.r * multiplier,
                    skeletonColor.g * slotColor.g * regionColor.g * multiplier,
                    skeletonColor.b * slotColor.b * regionColor.b * multiplier,
                    alpha);

                let numVertices = mesh.worldVerticesLength / 2;
                if (this.vertices.length < mesh.worldVerticesLength) {
                    this.vertices = spine.Utils.newFloatArray(mesh.worldVerticesLength);
                }
                let vertices = this.vertices;
                mesh.computeWorldVertices(slot, 0, mesh.worldVerticesLength, vertices, 0, Renderer.VERTEX_SIZE);

                let uvs = mesh.uvs;
                for (let i = 0, n = numVertices, u = 0, v = 2; i < n; i++) {
                    vertices[v++] = color.r;
                    vertices[v++] = color.g;
                    vertices[v++] = color.b;
                    vertices[v++] = color.a;
                    vertices[v++] = uvs[u++];
                    vertices[v++] = uvs[u++];
                    v += 2;
                }

                return vertices;
            }
        }
    }
}