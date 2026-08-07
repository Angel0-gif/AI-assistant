import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  checkmarkDoneOutline, chatbubblesOutline, settingsOutline, add, trash,
  send, logOutOutline, checkmarkDoneCircleOutline,
} from 'ionicons/icons';

addIcons({
  'checkmark-done-outline': checkmarkDoneOutline,
  'chatbubbles-outline': chatbubblesOutline,
  'settings-outline': settingsOutline,
  'add': add,
  'trash': trash,
  'send': send,
  'log-out-outline': logOutOutline,
  'checkmark-done-circle-outline': checkmarkDoneCircleOutline,
});

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, IonicModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
