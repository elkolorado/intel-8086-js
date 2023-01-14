# Intel 8086 emulator
----


All hex numbers must be in format (examples):
```py
0x000f  #word
0x0f    #byte   
```


----
### Available commands:


##### MOV 
```py
mov registry, hex           ;the size must match

#examples
mov ax, 0x000f
mov bh, 0x0f
mov cx, 0x695d
mov cl, ch
```



```py
#Addressing modes from memory to registry
#Displacement in hexademical!
mov registry, [bp]          #or bx
mov registry, [bp+hex]      #or bx
mov registry, [si+hex]      #or di
mov registry, [bp+si+hex]   #or bx/di

#examples
mov ax, [bp]
mov bx, [bp+0x0f]
mov cx, [di+0x1234]
mov dx, [bx+si+0x01]
```


```py
#addressing modes from registry to memory
mov [bp], registry          #or bx
mov [bp+hex], registry      #or bx
mov [si+hex], registry      #or di
mov [bp+si+hex], registry   #or bx/di

#examples
mov [bp], ax
mov [bx+0x0005], bx
mov [di+0x02], cx
mov [bp+si+0xfd], dx
```
---
##### XCHG
```py
#exchange between registers, or from memory to register and vice-versa
xchg registry, registry     #the size must match
xchg registry, [mem]        #mem is offset
xchg [mem], registry        #mem is offset

#examples
xchg ax, bx
xchg ax, [bp]
xchg [bp+0x0001], ax
```
---
##### Push & pop
```py
#uses stack pointer register (SP)
push registry               #only words
pop registry                #only words

#examples
push ax
pop cx
```

