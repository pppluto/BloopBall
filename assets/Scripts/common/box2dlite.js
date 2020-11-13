var Box2DLiteTS=function(t){"use strict";class s{constructor(t=0,s=0){this.x=t,this.y=s,window.vec2Total++}set(t=0,s=0){this.x=t,this.y=s}add(t){this.x+=t.x,this.y+=t.y}sub(t){this.x-=t.x,this.y-=t.y}mul(t){this.x*=t,this.y*=t}static add(t,i){return new s(t.x+i.x,t.y+i.y)}static sub(t,i){return new s(t.x-i.x,t.y-i.y)}static mulVV(t,i){return new s(t.x*i.x,t.y*i.y)}static mulSV(t,i){return new s(t*i.x,t*i.y)}static abs(t){return new s(Math.abs(t.x),Math.abs(t.y))}static neg(t){return new s(-t.x,-t.y)}static dot(t,s){return t.x*s.x+t.y*s.y}static crossVV(t,s){return t.x*s.y-t.y*s.x}static crossVS(t,i){return new s(i*t.y,-i*t.x)}static crossSV(t,i){return new s(-t*i.y,t*i.x)}}class i{constructor(t,i){if(this.col1=new s,this.col2=new s,"number"==typeof t&&void 0===i){const s=Math.cos(t),i=Math.sin(t);this.col1.set(s,i),this.col2.set(-i,s)}else"object"==typeof t&&"object"==typeof i&&(this.col1=t,this.col2=i);window.mat22Total++}static add(t,o){return new i(s.add(t.col1,o.col1),s.add(t.col2,o.col2))}static mulMV(t,i){return new s(t.col1.x*i.x+t.col2.x*i.y,t.col1.y*i.x+t.col2.y*i.y)}static mulMM(t,s){return new i(i.mulMV(t,s.col1),i.mulMV(t,s.col2))}static abs(t){return new i(s.abs(t.col1),s.abs(t.col2))}static transpose(t){return new i(new s(t.col1.x,t.col2.x),new s(t.col1.y,t.col2.y))}static invert(t){const s=t.col1.x,o=t.col2.x,e=t.col1.y,n=t.col2.y,l=new i;let a=s*n-o*e;return a=1/a,l.col1.x=a*n,l.col2.x=a*-o,l.col1.y=a*-e,l.col2.y=a*s,l}}function o(t,s,i){return Math.max(s,Math.min(t,i))}var e,n;!function(t){t[t.FACE_A_X=0]="FACE_A_X",t[t.FACE_A_Y=1]="FACE_A_Y",t[t.FACE_B_X=2]="FACE_B_X",t[t.FACE_B_Y=3]="FACE_B_Y"}(e||(e={})),function(t){t[t.NO_EDGE=0]="NO_EDGE",t[t.EDGE1=1]="EDGE1",t[t.EDGE2=2]="EDGE2",t[t.EDGE3=3]="EDGE3",t[t.EDGE4=4]="EDGE4"}(n||(n={}));class l{constructor(){this.inEdge1=n.NO_EDGE,this.outEdge1=n.NO_EDGE,this.inEdge2=n.NO_EDGE,this.outEdge2=n.NO_EDGE}}class a{constructor(){this.e=new l,this.value=0}flip(){const t=this.e,s=t.inEdge1,i=t.outEdge1;t.inEdge1=t.inEdge2,t.inEdge2=s,t.outEdge1=t.outEdge2,t.outEdge2=i}}class r{constructor(){this.v=new s,this.fp=new a}}function c(t,o,e,l,a){let c=i.transpose(l),h=s.neg(i.mulMV(c,a)),d=s.abs(h);const u=new r,y=new r;d.x>d.y?Math.sign(h.x)>0?(u.v.set(o.x,-o.y),u.fp.e.inEdge2=n.EDGE3,u.fp.e.outEdge2=n.EDGE4,y.v.set(o.x,o.y),y.fp.e.inEdge2=n.EDGE4,y.fp.e.outEdge2=n.EDGE1):(u.v.set(-o.x,o.y),u.fp.e.inEdge2=n.EDGE1,u.fp.e.outEdge2=n.EDGE2,y.v.set(-o.x,-o.y),y.fp.e.inEdge2=n.EDGE2,y.fp.e.outEdge2=n.EDGE3):Math.sign(h.y)>0?(u.v.set(o.x,o.y),u.fp.e.inEdge2=n.EDGE4,u.fp.e.outEdge2=n.EDGE1,y.v.set(-o.x,o.y),y.fp.e.inEdge2=n.EDGE1,y.fp.e.outEdge2=n.EDGE2):(u.v.set(-o.x,-o.y),u.fp.e.inEdge2=n.EDGE2,u.fp.e.outEdge2=n.EDGE3,y.v.set(o.x,-o.y),y.fp.e.inEdge2=n.EDGE3,y.fp.e.outEdge2=n.EDGE4),u.v=s.add(e,i.mulMV(l,u.v)),y.v=s.add(e,i.mulMV(l,y.v)),t[0]=u,t[1]=y}class h{constructor(){this.position=new s,this.normal=new s,this.r1=new s,this.r2=new s,this.separation=0,this.Pn=0,this.Pt=0,this.Pnb=0,this.massNormal=0,this.massTangent=0,this.bias=0,this.feature=new a}}function d(t,i,o,e,l){let a=0,c=s.dot(o,i[0].v)-e,h=s.dot(o,i[1].v)-e;if(c<=0&&(t[a]=i[0],a++),h<=0&&(t[a]=i[1],a++),c*h<0){let o=c/(c-h);t[a]=new r,t[a].v=s.add(i[0].v,s.mulSV(o,s.sub(i[1].v,i[0].v))),c>0?(t[a].fp=i[0].fp,t[a].fp.e.inEdge1=l,t[a].fp.e.inEdge2=n.NO_EDGE):(t[a].fp=i[1].fp,t[a].fp.e.outEdge1=l,t[a].fp.e.outEdge2=n.NO_EDGE),a++}return a}class u{constructor(t,o,l){this.world=t,o.id<l.id?(this.body1=o,this.body2=l):(this.body1=l,this.body2=o),this.contacts=[],this.numContacts=function(t,o,l){let a=s.mulSV(.5,o.width),r=s.mulSV(.5,l.width),u=o.position,y=l.position,E=new i(o.rotation),v=new i(l.rotation),b=i.transpose(E),m=i.transpose(v),V=s.sub(y,u),x=i.mulMV(b,V),p=i.mulMV(m,V),f=i.mulMM(b,v),g=i.abs(f),w=i.transpose(g),M=s.sub(s.sub(s.abs(x),a),i.mulMV(g,r));if(M.x>0||M.y>0)return 0;let S=s.sub(s.sub(s.abs(p),i.mulMV(w,a)),r);if(S.x>0||S.y>0)return 0;let _,A,I=e.FACE_A_X,D=M.x,G=x.x>0?E.col1:s.neg(E.col1);M.y>.95*D+.01*a.y&&(I=e.FACE_A_Y,D=M.y,G=x.y>0?E.col2:s.neg(E.col2)),S.x>.95*D+.01*r.x&&(I=e.FACE_B_X,D=S.x,G=p.x>0?v.col1:s.neg(v.col1)),S.y>.95*D+.01*r.y&&(I=e.FACE_B_Y,D=S.y,G=p.y>0?v.col2:s.neg(v.col2));let P,C,F,T,B,N,k=[];switch(I){case e.FACE_A_X:_=G,P=s.dot(u,_)+a.x,A=E.col2,N=s.dot(u,A),C=-N+a.y,F=N+a.y,T=n.EDGE3,B=n.EDGE1,c(k,r,y,v,_);break;case e.FACE_A_Y:_=G,P=s.dot(u,_)+a.y,A=E.col1,N=s.dot(u,A),C=-N+a.x,F=N+a.x,T=n.EDGE2,B=n.EDGE4,c(k,r,y,v,_);break;case e.FACE_B_X:_=s.neg(G),P=s.dot(y,_)+r.x,A=v.col2,N=s.dot(y,A),C=-N+r.y,F=N+r.y,T=n.EDGE3,B=n.EDGE1,c(k,a,u,E,_);break;case e.FACE_B_Y:_=s.neg(G),P=s.dot(y,_)+r.y,A=v.col1,N=s.dot(y,A),C=-N+r.x,F=N+r.x,T=n.EDGE2,B=n.EDGE4,c(k,a,u,E,_)}let X=[],Y=[],O=d(X,k,s.neg(A),C,T);if(O<2)return 0;if(O=d(Y,X,A,F,B),O<2)return 0;let j=0;for(let i=0;i<2;i++){let o=s.dot(_,Y[i].v)-P;o<=0&&(t[j]=new h,t[j].separation=o,t[j].normal=G,t[j].position=s.sub(Y[i].v,s.mulSV(o,_)),t[j].feature=Y[i].fp,I!==e.FACE_B_X&&I!==e.FACE_B_Y||t[j].feature.flip(),j++)}return j}(this.contacts,this.body1,this.body2),this.friction=Math.sqrt(this.body1.friction*this.body2.friction)}update(t,s){let i=[],o=this.contacts,e=this.numContacts,n=this.world.warmStarting;for(let l=0;l<s;l++){let s=t[l],a=-1;for(let t=0;t<e;t++){let i=o[t];if(s.feature.value===i.feature.value){a=t;break}}if(a>-1){let t=o[a];n?(s.Pn=t.Pn,s.Pt=t.Pt,s.Pnb=t.Pnb):(s.Pn=0,s.Pt=0,s.Pnb=0),i[l]=s}else i[l]=t[l]}this.contacts=i,this.numContacts=s}preStep(t){let i=this.contacts,o=this.numContacts,e=this.world.positionCorrection?.2:0,n=this.body1,l=this.body2,a=this.world.accumulateImpulses;for(let r=0;r<o;r++){let o=i[r],c=s.sub(o.position,n.position),h=s.sub(o.position,l.position),d=s.dot(c,o.normal),u=s.dot(h,o.normal),y=n.invMass+l.invMass;y+=n.invI*(s.dot(c,c)-d*d)+l.invI*(s.dot(h,h)-u*u),o.massNormal=1/y;let E=s.crossVS(o.normal,1),v=s.dot(c,E),b=s.dot(h,E),m=n.invMass+l.invMass;if(m+=n.invI*(s.dot(c,c)-v*v)+l.invI*(s.dot(h,h)-b*b),o.massTangent=1/m,o.bias=-e*t*Math.min(0,o.separation+.01),a){let t=s.add(s.mulSV(o.Pn,o.normal),s.mulSV(o.Pt,E));n.velocity.sub(s.mulSV(n.invMass,t)),n.angularVelocity-=n.invI*s.crossVV(c,t),l.velocity.add(s.mulSV(l.invMass,t)),l.angularVelocity+=l.invI*s.crossVV(h,t)}}}applyImpulse(){let t=this.contacts,i=this.numContacts,e=this.body1,n=this.body2,l=this.world.accumulateImpulses;for(let a=0;a<i;a++){let i=t[a];i.r1=s.sub(i.position,e.position),i.r2=s.sub(i.position,n.position);let r=s.sub(s.sub(s.add(n.velocity,s.crossSV(n.angularVelocity,i.r2)),e.velocity),s.crossSV(e.angularVelocity,i.r1)),c=s.dot(r,i.normal),h=i.massNormal*(-c+i.bias);if(l){let t=i.Pn;i.Pn=Math.max(t+h,0),h=i.Pn-t}else h=Math.max(h,0);let d=s.mulSV(h,i.normal);e.velocity.sub(s.mulSV(e.invMass,d)),e.angularVelocity-=e.invI*s.crossVV(i.r1,d),n.velocity.add(s.mulSV(n.invMass,d)),n.angularVelocity+=n.invI*s.crossVV(i.r2,d),r=s.sub(s.sub(s.add(n.velocity,s.crossSV(n.angularVelocity,i.r2)),e.velocity),s.crossSV(e.angularVelocity,i.r1));let u=s.crossVS(i.normal,1),y=s.dot(r,u),E=i.massTangent*-y;if(l){let t=this.friction*i.Pn,s=i.Pt;i.Pt=o(s+E,-t,t),E=i.Pt-s}else{let t=this.friction*h;E=o(E,-t,t)}let v=s.mulSV(E,u);e.velocity.sub(s.mulSV(e.invMass,v)),e.angularVelocity-=e.invI*s.crossVV(i.r1,v),n.velocity.add(s.mulSV(n.invMass,v)),n.angularVelocity+=n.invI*s.crossVV(i.r2,v)}}}class y{constructor(t,s){this.bodyA=t,this.bodyB=s,this.value=t.id+":"+s.id}}class E{constructor(t,s){this.first=t,this.second=s}}return t.Body=class{constructor(t,i){this.position=new s,this.rotation=0,this.velocity=new s,this.angularVelocity=0,this.force=new s,this.torque=0,this.width=new s,this.friction=.2,this.mass=Number.MAX_VALUE,this.invMass=0,this.I=Number.MAX_VALUE,this.invI=0,this.id=0,this.set(t,i)}set(t,s){return this.width=t,this.mass=s,s<Number.MAX_VALUE?(this.invMass=1/s,this.I=s*(t.x*t.x+t.y*t.y)/12,this.invI=1/this.I):(this.invMass=0,this.I=Number.MAX_VALUE,this.invI=0),this}addForce(t){return this.force.add(t),this}},t.CanvasRenderer=class{constructor(t){this.canvas=t,this.context=t.getContext("2d")}render(t){const s=this.context,i=t.bodies,o=t.joints,e=t.arbiters;s.clearRect(0,0,this.canvas.width,this.canvas.height);for(let t=0;t<i.length;t++)this.renderBody(i[t],s);for(let t=0;t<e.length;t++){let i=e[t].second;for(let t=0;t<i.contacts.length;t++)this.renderContact(i.contacts[t],s)}for(let t=0;t<o.length;t++)this.renderJoint(o[t],s)}renderBody(t,o){let e=new i(t.rotation),n=t.position,l=s.mulSV(.5,t.width),a=s.add(n,i.mulMV(e,new s(-l.x,-l.y))),r=s.add(n,i.mulMV(e,new s(l.x,-l.y))),c=s.add(n,i.mulMV(e,new s(l.x,l.y))),h=s.add(n,i.mulMV(e,new s(-l.x,l.y))),d=s.add(n,i.mulMV(e,new s(l.x,0)));o.strokeStyle="black",o.lineWidth=.5,o.beginPath(),o.arc(t.position.x,t.position.y,2,0,2*Math.PI),o.stroke(),o.beginPath(),o.moveTo(a.x,a.y),o.lineTo(r.x,r.y),o.lineTo(c.x,c.y),o.lineTo(h.x,h.y),o.lineTo(a.x,a.y),o.stroke(),o.beginPath(),o.moveTo(n.x,n.y),o.lineTo(d.x,d.y),o.stroke()}renderContact(t,s){s.strokeStyle="red",s.lineWidth=.5,s.beginPath(),s.arc(t.position.x,t.position.y,2,0,2*Math.PI),s.stroke()}renderJoint(t,o){let e=t.body1,n=t.body2,l=new i(e.rotation),a=new i(n.rotation),r=e.position,c=s.add(r,i.mulMV(l,t.localAnchor1)),h=n.position,d=s.add(h,i.mulMV(a,t.localAnchor2));o.beginPath(),o.moveTo(r.x,r.y),o.lineTo(c.x,c.y),o.lineTo(h.x,h.y),o.lineTo(d.x,d.y),o.stroke()}},t.Joint=class{constructor(){this.M=new i,this.localAnchor1=new s,this.localAnchor2=new s,this.r1=new s,this.r2=new s,this.bias=new s,this.P=new s,this.biasFactor=.2,this.softness=0}set(t,o,e,n){this.world=t,this.body1=o,this.body2=e;let l=new i(o.rotation),a=new i(e.rotation),r=i.transpose(l),c=i.transpose(a);this.localAnchor1=i.mulMV(r,s.sub(n,o.position)),this.localAnchor2=i.mulMV(c,s.sub(n,e.position))}preStep(t){const o=this.body1,e=this.body2;let n=new i(o.rotation),l=new i(e.rotation),a=i.mulMV(n,this.localAnchor1),r=i.mulMV(l,this.localAnchor2),c=new i;c.col1.x=o.invMass+e.invMass,c.col1.y=0,c.col2.x=0,c.col2.y=o.invMass+e.invMass;let h=new i;h.col1.x=o.invI*a.y*a.y,h.col1.y=-o.invI*a.x*a.y,h.col2.x=-o.invI*a.x*a.y,h.col2.y=o.invI*a.x*a.x;let d=new i;d.col1.x=e.invI*r.y*r.y,d.col1.y=-e.invI*r.x*r.y,d.col2.x=-e.invI*r.x*r.y,d.col2.y=e.invI*r.x*r.x;let u=i.add(i.add(c,h),d);u.col1.x+=this.softness,u.col2.y+=this.softness,this.M=i.invert(u);let y=s.add(o.position,a),E=s.add(e.position,r),v=s.sub(E,y);this.world.positionCorrection?this.bias=s.mulSV(-this.biasFactor,s.mulSV(t,v)):this.bias.set(0,0),this.world.warmStarting?(o.velocity.sub(s.mulSV(o.invMass,this.P)),o.angularVelocity-=o.invI*s.crossVV(a,this.P),e.velocity.add(s.mulSV(e.invMass,this.P)),e.angularVelocity+=e.invI*s.crossVV(r,this.P)):this.P.set(0,0),this.r1=a,this.r2=r}applyImpulse(){const t=this.body1,o=this.body2,e=this.r1,n=this.r2;let l=s.sub(s.sub(s.add(o.velocity,s.crossSV(o.angularVelocity,n)),t.velocity),s.crossSV(t.angularVelocity,e)),a=new s;a=i.mulMV(this.M,s.sub(s.sub(this.bias,l),s.mulSV(this.softness,this.P))),t.velocity.sub(s.mulSV(t.invMass,a)),t.angularVelocity-=t.invI*s.crossVV(e,a),o.velocity.add(s.mulSV(o.invMass,a)),o.angularVelocity+=o.invI*s.crossVV(n,a),this.P.add(a)}},t.Vec2=s,t.World=class{constructor(t=new s(0,9.807),i=10){this.bodyIdSeed=0,this.bodies=[],this.joints=[],this.arbiters=[],this.gravity=new s,this.iterations=10,this.accumulateImpulses=!0,this.warmStarting=!0,this.positionCorrection=!0,this.gravity.x=t.x,this.gravity.y=t.y,this.iterations=i}addBody(t){return this.bodyIdSeed++,t.id=this.bodyIdSeed,this.bodies.push(t),this}addJoint(t){return this.joints.push(t),this}clear(){return this.bodies=[],this.joints=[],this.arbiters=[],this}broadPhase(){let t=this.bodies,s=t.length,i=this.arbiters;for(let o=0;o<s-1;o++){let e=t[o];for(let n=o+1;n<s;n++){let s=t[n];if(0===e.invMass&&0===s.invMass)continue;let o=new u(this,e,s),l=new y(e,s),a=-1;for(let t=0;t<i.length;t++)if(i[t].first.value===l.value){a=t;break}o.numContacts>0?-1===a?i.push(new E(l,o)):i[a].second.update(o.contacts,o.numContacts):0===o.numContacts&&a>-1&&i.splice(a,1)}}}step(t){let i=t>0?1/t:0;this.broadPhase();const o=this.bodies,e=this.gravity;for(let i=0;i<o.length;i++){let n=o[i];0!==n.invMass&&(n.velocity.add(s.mulSV(t,s.add(e,s.mulSV(n.invMass,n.force)))),n.angularVelocity+=t*n.invI*n.torque)}const n=this.arbiters,l=this.joints;for(let t=0;t<n.length;t++)n[t].second.preStep(i);for(let t=0;t<l.length;t++)l[t].preStep(i);for(let t=0;t<this.iterations;t++){for(let t=0;t<n.length;t++)n[t].second.applyImpulse();for(let t=0;t<l.length;t++)l[t].applyImpulse()}for(let i=0;i<o.length;i++){let e=o[i];e.position.add(s.mulSV(t,e.velocity)),e.rotation+=t*e.angularVelocity,e.force.set(0,0),e.torque=0}}},t}({});
